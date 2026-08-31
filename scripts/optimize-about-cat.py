import os
import sys

import bpy


def project_args():
    if "--" not in sys.argv:
        raise RuntimeError("Expected source and destination paths after --")
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 2:
        raise RuntimeError("Usage: blender --background --python script.py -- source.glb destination.glb")
    return [os.path.abspath(path) for path in args]


source_path, destination_path = project_args()
os.makedirs(os.path.dirname(destination_path), exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source_path)

mesh_objects = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
source_vertices = sum(len(obj.data.vertices) for obj in mesh_objects)

# The AI-generated source is substantially denser than a web camera distance needs.
# Blender's collapse modifier keeps UVs and materials while reducing transfer/GPU cost.
for obj in mesh_objects:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    modifier = obj.modifiers.new(name="Web decimation", type="DECIMATE")
    modifier.decimate_type = "COLLAPSE"
    modifier.ratio = 0.18
    modifier.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=modifier.name)

optimized_vertices = sum(len(obj.data.vertices) for obj in mesh_objects)

# The source textures are much larger than needed for an on-screen portfolio model.
# Resize in memory before export; WebP keeps the painted surface while reducing transfer size.
for image in bpy.data.images:
    width, height = image.size
    longest_edge = max(width, height)
    if longest_edge > 1024:
        ratio = 1024 / longest_edge
        image.scale(max(1, round(width * ratio)), max(1, round(height * ratio)))

bpy.ops.export_scene.gltf(
    filepath=destination_path,
    export_format="GLB",
    export_apply=True,
    export_animations=False,
    export_cameras=False,
    export_lights=False,
    export_texcoords=True,
    export_normals=True,
    export_tangents=False,
    export_materials="EXPORT",
    export_image_format="WEBP",
    export_image_quality=82,
    export_meshopt_compression_enable=True,
)

print(
    "ABOUT_CAT_OPTIMIZED",
    {
        "source": source_path,
        "destination": destination_path,
        "source_vertices": source_vertices,
        "optimized_vertices": optimized_vertices,
        "output_bytes": os.path.getsize(destination_path),
    },
)
