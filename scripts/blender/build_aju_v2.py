from pathlib import Path
import math

import bpy
from mathutils import Vector


PROJECT_ROOT = Path(__file__).resolve().parents[2]
REFERENCE_DIR = PROJECT_ROOT / "design" / "references"
MODEL_DIR = PROJECT_ROOT / "models"
PUBLIC_MODEL_DIR = PROJECT_ROOT / "public" / "models"
PREVIEW_DIR = PROJECT_ROOT / "design" / "blender"

BLEND_PATH = MODEL_DIR / "aju-explorer-cat-v2.blend"
GLB_PATH = PUBLIC_MODEL_DIR / "aju-explorer-cat-v2.glb"
PREVIEW_PATH = PREVIEW_DIR / "aju-explorer-cat-v2-preview.png"

for folder in (MODEL_DIR, PUBLIC_MODEL_DIR, PREVIEW_DIR):
    folder.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.materials,
        bpy.data.cameras,
        bpy.data.lights,
    ):
        for datablock in list(datablocks):
            if datablock.users == 0:
                datablocks.remove(datablock)


clear_scene()
scene = bpy.context.scene
scene.name = "Aju Explorer Cat V2"

character_collection = bpy.data.collections.new("CHARACTER")
reference_collection = bpy.data.collections.new("REFERENCES")
stage_collection = bpy.data.collections.new("STAGE")
scene.collection.children.link(character_collection)
scene.collection.children.link(reference_collection)
scene.collection.children.link(stage_collection)


def move_to_collection(obj, collection):
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def make_material(name, color, roughness=0.86, metallic=0.0, bump_strength=0.08):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (560, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (260, 0)
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    metallic_input = bsdf.inputs.get("Metallic IOR") or bsdf.inputs.get("Metallic")
    if metallic_input is not None:
        metallic_input.default_value = metallic

    noise = nodes.new("ShaderNodeTexNoise")
    noise.name = f"{name}_ClayNoise"
    noise.inputs["Scale"].default_value = 19.0
    noise.inputs["Detail"].default_value = 3.0
    noise.inputs["Roughness"].default_value = 0.72
    noise.inputs["Distortion"].default_value = 0.15

    bump = nodes.new("ShaderNodeBump")
    bump.name = f"{name}_ClayBump"
    bump.inputs["Strength"].default_value = bump_strength
    bump.inputs["Distance"].default_value = 0.045
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    return material


cream = make_material("MAT_Fur_Cream", (0.82, 0.63, 0.42), 0.94, bump_strength=0.11)
cream_light = make_material("MAT_Muzzle", (0.94, 0.78, 0.56), 0.94, bump_strength=0.09)
orange = make_material("MAT_Fur_Orange", (0.72, 0.30, 0.09), 0.93, bump_strength=0.11)
orange_dark = make_material("MAT_Fur_Orange_Dark", (0.46, 0.15, 0.055), 0.94, bump_strength=0.1)
charcoal = make_material("MAT_Fur_Charcoal", (0.16, 0.105, 0.082), 0.95, bump_strength=0.11)
pink = make_material("MAT_Ear_Inner", (0.66, 0.25, 0.22), 0.9, bump_strength=0.06)
eye_white = make_material("MAT_Eye_White", (0.98, 0.9, 0.76), 0.64, bump_strength=0.025)
pupil = make_material("MAT_Pupil", (0.04, 0.025, 0.018), 0.4, bump_strength=0.0)
nose = make_material("MAT_Nose", (0.68, 0.14, 0.12), 0.62, bump_strength=0.04)
scarf = make_material("MAT_Scarf", (0.58, 0.19, 0.11), 0.92, bump_strength=0.1)
backpack = make_material("MAT_Backpack", (0.28, 0.30, 0.12), 0.94, bump_strength=0.11)
backpack_dark = make_material("MAT_Backpack_Dark", (0.18, 0.20, 0.075), 0.95, bump_strength=0.09)
leather = make_material("MAT_Leather", (0.43, 0.18, 0.075), 0.88, bump_strength=0.08)
leather_dark = make_material("MAT_Leather_Dark", (0.24, 0.08, 0.035), 0.9, bump_strength=0.07)
bedroll = make_material("MAT_Bedroll", (0.76, 0.34, 0.08), 0.94, bump_strength=0.12)
metal = make_material("MAT_Metal", (0.36, 0.31, 0.25), 0.48, metallic=0.5, bump_strength=0.025)
gold = make_material("MAT_Buckle", (0.63, 0.36, 0.08), 0.45, metallic=0.35, bump_strength=0.02)
fish_blue = make_material("MAT_Fish", (0.22, 0.34, 0.4), 0.88, bump_strength=0.05)
whisker_mat = make_material("MAT_Whiskers", (0.16, 0.09, 0.055), 0.74, bump_strength=0.0)


root = bpy.data.objects.new("AJU_ROOT", None)
root["character"] = "阿橘 / Aju Explorer Cat"
root["version"] = "2.0"
root["source"] = "AI-generated reference supplied by owner"
root["rigged"] = False
character_collection.objects.link(root)


def finish_object(obj, name, material=None, parent=root, smooth=True):
    obj.name = name
    move_to_collection(obj, character_collection)
    obj.parent = parent
    if material is not None:
        obj.data.materials.append(material)
    if smooth and hasattr(obj.data, "polygons"):
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    return obj


def apply_scale(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def uv_sphere(name, location, scale, material, segments=64, rings=40, parent=root):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.scale = scale
    apply_scale(obj)
    return finish_object(obj, name, material, parent)


def rounded_cube(name, location, dimensions, material, bevel=0.12, rotation=(0, 0, 0), parent=root):
    bpy.ops.mesh.primitive_cube_add(location=location, rotation=rotation)
    obj = bpy.context.object
    obj.dimensions = dimensions
    apply_scale(obj)
    modifier = obj.modifiers.new("Soft clay edges", "BEVEL")
    modifier.width = bevel
    modifier.segments = 5
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return finish_object(obj, name, material, parent)


def cylinder(name, location, radius, depth, material, rotation=(0, 0, 0), vertices=48, parent=root):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    bevel = obj.modifiers.new("Rounded cylinder edges", "BEVEL")
    bevel.width = min(radius * 0.16, 0.075)
    bevel.segments = 4
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return finish_object(obj, name, material, parent)


def torus(name, location, major_radius, minor_radius, material, rotation=(0, 0, 0), parent=root):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=64,
        minor_segments=16,
        location=location,
        rotation=rotation,
    )
    return finish_object(bpy.context.object, name, material, parent)


def cone(name, location, radius, depth, material, rotation=(0, 0, 0), parent=root):
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=radius, radius2=0.035, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    bevel = obj.modifiers.new("Rounded ear", "BEVEL")
    bevel.width = 0.065
    bevel.segments = 4
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return finish_object(obj, name, material, parent)


def curve_tube(name, points, radius, material, parent=root, resolution=4):
    curve_data = bpy.data.curves.new(name, "CURVE")
    curve_data.dimensions = "3D"
    curve_data.resolution_u = resolution
    curve_data.bevel_depth = radius
    curve_data.bevel_resolution = 4
    spline = curve_data.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for point, coordinate in zip(spline.bezier_points, points):
        point.co = coordinate
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"
    obj = bpy.data.objects.new(name, curve_data)
    character_collection.objects.link(obj)
    curve_data.materials.append(material)
    obj.parent = parent
    return obj


body = uv_sphere("BODY_Main", (0, 0, 1.62), (1.14, 0.82, 1.56), cream)
body["rig_region"] = "torso"

head = uv_sphere("HEAD_Main", (0, -0.03, 3.18), (1.2, 0.9, 1.02), orange)
head.data.materials.append(charcoal)
for polygon in head.data.polygons:
    center_x = sum(head.data.vertices[i].co.x for i in polygon.vertices) / len(polygon.vertices)
    polygon.material_index = 1 if center_x < 0 else 0
head["rig_region"] = "head"

# Ears are broad and slightly tilted outward like the reference.
left_ear = cone("EAR_L_Outer", (-0.63, 0.0, 4.03), 0.48, 1.02, charcoal, rotation=(0.1, -0.1, -0.11))
right_ear = cone("EAR_R_Outer", (0.63, 0.0, 4.03), 0.48, 1.02, orange, rotation=(0.1, 0.1, 0.11))
cone("EAR_L_Inner", (-0.63, -0.22, 4.02), 0.28, 0.7, pink, rotation=(0.1, -0.1, -0.11))
cone("EAR_R_Inner", (0.63, -0.22, 4.02), 0.28, 0.7, pink, rotation=(0.1, 0.1, 0.11))

# Large inset eyes and oversized muzzle are the main likeness cues.
for side, x in (("L", -0.34), ("R", 0.34)):
    uv_sphere(f"EYE_{side}_White", (x, -0.84, 3.36), (0.34, 0.17, 0.42), eye_white, segments=48, rings=32)
    pupil_x = x + (0.04 if side == "L" else -0.04)
    uv_sphere(f"EYE_{side}_Pupil", (pupil_x, -1.0, 3.34), (0.095, 0.052, 0.13), pupil, segments=32, rings=20)
    uv_sphere(f"EYE_{side}_Catchlight", (pupil_x - 0.025, -1.045, 3.39), (0.024, 0.016, 0.03), eye_white, segments=20, rings=12)

uv_sphere("MUZZLE_L", (-0.3, -0.77, 2.94), (0.59, 0.29, 0.39), cream_light)
uv_sphere("MUZZLE_R", (0.3, -0.77, 2.94), (0.59, 0.29, 0.39), cream_light)
uv_sphere("NOSE", (0, -1.05, 3.08), (0.15, 0.09, 0.11), nose, segments=40, rings=24)

curve_tube("MOUTH_Center", [(0, -1.08, 3.0), (0, -1.09, 2.84)], 0.012, whisker_mat)
curve_tube("MOUTH_Left", [(0, -1.09, 2.84), (-0.08, -1.09, 2.78), (-0.15, -1.08, 2.82)], 0.011, whisker_mat)
curve_tube("MOUTH_Right", [(0, -1.09, 2.84), (0.08, -1.09, 2.78), (0.15, -1.08, 2.82)], 0.011, whisker_mat)

for side, x_direction in (("L", -1), ("R", 1)):
    for index, z_offset in enumerate((-0.12, 0.0, 0.12), start=1):
        start = (x_direction * 0.54, -0.93, 2.92 + z_offset)
        end = (x_direction * 1.38, -1.0, 2.9 + z_offset * 1.25)
        curve_tube(f"WHISKER_{side}_{index}", [start, end], 0.012, whisker_mat)

# Relaxed arms slightly clear of the torso for future rigging.
for side, x, z_rotation in (("L", -1.03, -0.13), ("R", 1.03, 0.13)):
    arm = uv_sphere(f"ARM_{side}", (x, -0.05, 1.73), (0.34, 0.31, 0.78), cream)
    arm.rotation_euler[1] = z_rotation
    uv_sphere(f"PAW_{side}", (x + (-0.04 if side == "L" else 0.04), -0.1, 1.06), (0.35, 0.32, 0.33), cream_light)
    uv_sphere(f"ARM_PATCH_{side}", (x + (-0.04 if side == "L" else 0.04), -0.39, 1.72), (0.22, 0.055, 0.24), orange, segments=40, rings=24)

# Short feet are partly absorbed by the pear-shaped torso.
for side, x in (("L", -0.45), ("R", 0.45)):
    uv_sphere(f"FOOT_{side}", (x, -0.07, 0.24), (0.42, 0.48, 0.34), cream)
    for toe_index, toe_x in enumerate((-0.12, 0.0, 0.12), start=1):
        curve_tube(
            f"FOOT_{side}_Toe_{toe_index}",
            [(x + toe_x, -0.49, 0.18), (x + toe_x, -0.5, 0.29)],
            0.012,
            leather_dark,
        )

# Painted body patches follow the surface as shallow ellipsoids.
uv_sphere("BODY_PATCH_L", (-0.91, -0.42, 1.02), (0.23, 0.055, 0.37), orange, segments=40, rings=24)
uv_sphere("BODY_PATCH_R", (0.92, -0.42, 0.82), (0.22, 0.055, 0.33), orange, segments=40, rings=24)

# Scarf: thin collar plus a soft central knot and two drops.
torus("SCARF_Collar", (0, -0.01, 2.35), 0.83, 0.1, scarf, rotation=(math.pi / 2, 0, 0))
uv_sphere("SCARF_Knot", (0, -0.79, 2.25), (0.21, 0.14, 0.2), scarf)
uv_sphere("SCARF_Tail_L", (-0.16, -0.76, 1.98), (0.16, 0.1, 0.36), scarf)
uv_sphere("SCARF_Tail_R", (0.17, -0.75, 1.96), (0.16, 0.1, 0.38), scarf)

# Backpack is intentionally large and structurally readable from side/back views.
rounded_cube("BACKPACK_Main", (0, 0.88, 2.1), (1.7, 0.72, 2.65), backpack, bevel=0.22)
rounded_cube("BACKPACK_Back_Panel", (0, 1.28, 2.12), (1.45, 0.14, 2.18), backpack_dark, bevel=0.12)
rounded_cube("BACKPACK_Lower_Pocket", (0, 1.41, 1.5), (1.02, 0.18, 0.67), backpack, bevel=0.12)
rounded_cube("BACKPACK_Top_Flap", (0, 1.4, 2.73), (1.35, 0.17, 0.58), backpack, bevel=0.12)

for side, x in (("L", -0.58), ("R", 0.58)):
    curve_tube(
        f"BACKPACK_FRONT_STRAP_{side}",
        [(x, 0.38, 2.9), (x * 1.2, -0.58, 2.18), (x * 1.32, -0.45, 1.15)],
        0.07,
        leather,
    )
    curve_tube(
        f"BACKPACK_REAR_STRAP_{side}",
        [(x, 1.5, 3.24), (x, 1.52, 1.8)],
        0.055,
        leather,
    )
    cylinder(
        f"BACKPACK_STUD_{side}",
        (x, 1.56, 2.65),
        0.075,
        0.045,
        gold,
        rotation=(math.pi / 2, 0, 0),
        vertices=32,
    )

# Bedroll and its visible spiral end.
cylinder("BEDROLL_Main", (0, 1.02, 3.55), 0.4, 1.78, bedroll, rotation=(0, math.pi / 2, 0), vertices=64)
torus("BEDROLL_Strap_L", (-0.54, 1.02, 3.55), 0.41, 0.045, leather, rotation=(0, math.pi / 2, 0))
torus("BEDROLL_Strap_R", (0.54, 1.02, 3.55), 0.41, 0.045, leather, rotation=(0, math.pi / 2, 0))
torus("BEDROLL_Spiral", (0.91, 1.02, 3.55), 0.22, 0.055, bedroll, rotation=(0, math.pi / 2, 0))
uv_sphere("BEDROLL_Core", (0.91, 1.02, 3.55), (0.075, 0.07, 0.07), bedroll)

# Right side pouch, buckles and fish charm.
pouch = rounded_cube("SIDE_POUCH", (0.96, 1.05, 2.22), (0.64, 0.34, 0.78), leather, bevel=0.12)
rounded_cube("SIDE_POUCH_Flap", (0.96, 1.24, 2.47), (0.68, 0.08, 0.28), leather_dark, bevel=0.07)
rounded_cube("SIDE_POUCH_Tab", (0.96, 1.3, 2.33), (0.14, 0.07, 0.27), leather, bevel=0.035)
cylinder("SIDE_POUCH_Button", (0.96, 1.36, 2.36), 0.055, 0.04, gold, rotation=(math.pi / 2, 0, 0), vertices=24)
torus("SIDE_POUCH_Ring", (1.19, 1.26, 1.92), 0.11, 0.025, metal, rotation=(math.pi / 2, 0, 0))
curve_tube("FISH_String", [(1.19, 1.27, 1.82), (1.19, 1.28, 1.57)], 0.012, leather_dark)
uv_sphere("FISH_Body", (1.19, 1.29, 1.38), (0.14, 0.07, 0.24), fish_blue, segments=40, rings=24)
cone("FISH_Tail", (1.19, 1.29, 1.16), 0.13, 0.23, fish_blue, rotation=(math.pi, 0, 0))

# Continuous curved tail with two darker bands.
tail_points = [(0.72, 0.48, 0.78), (1.3, 0.52, 0.72), (1.65, 0.18, 0.86), (1.53, -0.08, 1.04)]
curve_tube("TAIL_Main", tail_points, 0.15, orange)
torus("TAIL_Band_1", (1.21, 0.43, 0.75), 0.15, 0.035, orange_dark, rotation=(math.pi / 2, 0.2, 0))
torus("TAIL_Band_2", (1.52, 0.14, 0.91), 0.15, 0.035, orange_dark, rotation=(math.pi / 2, -0.35, 0))


def add_anchor(name, location):
    anchor = bpy.data.objects.new(name, None)
    anchor.empty_display_type = "SPHERE"
    anchor.empty_display_size = 0.09
    anchor.location = location
    anchor.parent = root
    anchor["role"] = "camera-focus-anchor"
    character_collection.objects.link(anchor)


add_anchor("FOCUS_BODY", (0, -0.4, 1.7))
add_anchor("FOCUS_HEAD", (0, -0.65, 3.25))
add_anchor("FOCUS_HANDS", (0, -0.65, 1.3))
add_anchor("FOCUS_BACKPACK", (0.8, 0.9, 2.2))


def add_reference(name, image_path, location, rotation, size=5.0):
    bpy.ops.object.empty_add(type="IMAGE", location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data = bpy.data.images.load(str(image_path), check_existing=True)
    obj.empty_display_size = size
    obj.color[3] = 0.28
    obj.show_in_front = True
    obj.hide_render = True
    move_to_collection(obj, reference_collection)
    return obj


# References are offset behind each orthographic modeling view and hidden from render/export.
add_reference("REF_FRONT", REFERENCE_DIR / "aju-front.png", (0, 1.7, 2.35), (math.pi / 2, 0, 0), 4.8)
add_reference("REF_SIDE", REFERENCE_DIR / "aju-side.png", (-1.8, 0, 2.35), (math.pi / 2, 0, math.pi / 2), 4.8)
add_reference("REF_BACK", REFERENCE_DIR / "aju-back.png", (0, -1.7, 2.35), (math.pi / 2, 0, math.pi), 4.8)
reference_collection.hide_render = True

# Preview stage.
bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -0.12))
ground = bpy.context.object
ground.name = "Preview_Ground"
move_to_collection(ground, stage_collection)
ground_mat = make_material("MAT_Preview_Ground", (0.72, 0.45, 0.3), 0.98, bump_strength=0.0)
ground.data.materials.append(ground_mat)


def add_area_light(name, location, energy, size, color):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = "DISK"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    stage_collection.objects.link(obj)
    direction = Vector((0, 0, 2.1)) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return obj


add_area_light("Key_Light", (-4.5, -5.5, 7.5), 1200, 4.0, (1.0, 0.78, 0.62))
add_area_light("Fill_Light", (4.5, -2.5, 4.8), 700, 3.0, (0.65, 0.78, 1.0))
add_area_light("Rim_Light", (0, 4.5, 6.5), 850, 3.0, (1.0, 0.55, 0.32))

camera_data = bpy.data.cameras.new("Preview_Camera")
camera = bpy.data.objects.new("Preview_Camera", camera_data)
stage_collection.objects.link(camera)
camera.location = (6.4, -9.7, 5.5)
camera.data.lens = 62
camera.data.sensor_width = 36
camera.rotation_euler = (Vector((0, 0, 2.15)) - camera.location).to_track_quat("-Z", "Y").to_euler()
scene.camera = camera

world = bpy.data.worlds.new("Aju_World") if not bpy.data.worlds else bpy.data.worlds[0]
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.28, 0.17, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.6

scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 900
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = str(PREVIEW_PATH)
scene.render.film_transparent = False

# Save the editable scene before rendering/exporting.
bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
bpy.ops.render.render(write_still=True)

# Export only the character collection, keeping named parts and focus anchors.
# Blender 5.2 reliably preserves a whole active collection, while exporting a
# parented selection can collapse to the active mesh only.
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection.children[character_collection.name]
for obj in character_collection.all_objects:
    obj.hide_viewport = False
    obj.hide_render = False

bpy.ops.export_scene.gltf(
    filepath=str(GLB_PATH),
    export_format="GLB",
    use_selection=False,
    use_active_collection=True,
    use_active_collection_with_nested=True,
    export_apply=True,
    export_extras=True,
    export_materials="EXPORT",
    export_yup=True,
)

print(f"BLEND_FILE={BLEND_PATH}")
print(f"GLB_FILE={GLB_PATH}")
print(f"PREVIEW_FILE={PREVIEW_PATH}")
print(f"CHARACTER_OBJECTS={len(character_collection.all_objects)}")
