"""Local five-pose leg repair and action-loop renders. Never overwrite sources."""
import bpy,sys,pathlib,math,json,hashlib,struct
from mathutils import Vector,Matrix
root=pathlib.Path(__file__).resolve().parent.parent
key=sys.argv[sys.argv.index('--')+1];walk=key in ('base','hulk','venom','boss','demon')
revision=sys.argv[sys.argv.index('--')+2] if len(sys.argv)>sys.argv.index('--')+2 else 'v2'
out=root/'overhaul-workbench'/('motion-'+revision)/key;out.mkdir(parents=True,exist_ok=True)
assert not (out/'receipt.json').exists(),'Existing completed output; use a new revision'
src=root/'assets/models'/f'{key.removesuffix("-action")}.glb'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(src))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];arms=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
for a in arms:
 if a.animation_data:
  a.animation_data.action=None
  for t in a.animation_data.nla_tracks:t.mute=True
 for p in a.pose.bones:p.matrix_basis.identity()
bpy.context.view_layer.update()
body=max(meshes,key=lambda o:len(o.data.vertices))
pts=[body.matrix_world@v.co for v in body.data.vertices];lo=Vector([min(p[k] for p in pts) for k in range(3)]);hi=Vector([max(p[k] for p in pts) for k in range(3)]);H=hi.z-lo.z;cx=(lo.x+hi.x)/2
def z(f):return lo.z+f*H
def ramp(v,a,b):
 t=max(0,min(1,(v-a)/(b-a)));return t*t*(3-2*t)
checks=[]
if walk:
 # Preserve the old rig's two leg assignments, including crossing toes.
 labels={};legpts={'L':[],'R':[]}
 for o in meshes:
  labels[o.name]={}
  groupnames={g.index:g.name for g in o.vertex_groups}
  for v in o.data.vertices:
   p=o.matrix_world@v.co;votes={'L':0,'R':0}
   for g in v.groups:
    n=groupnames[g.group]
    if n in ('thigh.L','shin.L','foot.L','leg_left'):votes['L']+=g.weight
    if n in ('thigh.R','shin.R','foot.R','leg_right'):votes['R']+=g.weight
   side=max(votes,key=votes.get) if max(votes.values())>0 else ('L' if p.x<cx else 'R')
   labels[o.name][v.index]=side
   if o==body and p.z<z(.13):legpts[side].append(p)
  world=o.matrix_world.copy();o.parent=None;o.matrix_world=world
  for m in list(o.modifiers):
   if m.type=='ARMATURE':o.modifiers.remove(m)
  o.vertex_groups.clear()
 for a in arms:bpy.data.objects.remove(a,do_unlink=True)
 data=bpy.data.armatures.new('Articulated five-pose legs');rig=bpy.data.objects.new(key+' motion v2',data);bpy.context.collection.objects.link(rig);bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
 specs=[('root',(cx,0,lo.z),(cx,0,z(.1)),None),('pelvis',(cx,0,z(.3)),(cx,0,z(.48)),'root'),('head',(cx,0,z(.6)),(cx,0,z(.85)),'pelvis')];anchors={}
 for side in ('L','R'):
  assert legpts[side],side+' leg missing';ps=legpts[side];x=sum(p.x for p in ps)/len(ps);y=sum(p.y for p in ps)/len(ps)
  hip=Vector((x,y+.018*H,z(.29)));knee=Vector((x,y-.035*H,z(.18)));ankle=Vector((x,y,z(.065)));toe=ankle+Vector((0,-.07*H,0));anchors[side]=(hip,knee,ankle,toe)
  specs += [('thigh.'+side,hip,knee,'pelvis'),('shin.'+side,knee,ankle,'thigh.'+side),('foot.'+side,ankle,toe,'shin.'+side)]
 for n,h,t,parent in specs:
  b=data.edit_bones.new(n);b.head=h;b.tail=t
  if parent:b.parent=data.edit_bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT')
 for o in meshes:
  groups={n:o.vertex_groups.new(name=n) for n,*_ in specs}
  for v in o.data.vertices:
   p=o.matrix_world@v.co;f=(p.z-lo.z)/H;side=labels[o.name][v.index]
   if o!=body:weights={'pelvis':1}
   elif f<.31:
    attach=1-ramp(f,.23,.31);foot=1-ramp(f,.085,.125);thigh=ramp(f,.165,.215);shin=(1-foot)*(1-thigh)
    weights={'pelvis':1-attach,'foot.'+side:attach*foot,'shin.'+side:attach*shin,'thigh.'+side:attach*(1-foot)*thigh}
   else:
    head=ramp(f,.58,.67)*(1-ramp(abs(p.x-cx)/H,.2,.36));weights={'pelvis':1-head,'head':head}
   assert abs(sum(weights.values())-1)<1e-6
   for n,w in weights.items():
    if w>0:groups[n].add([v.index],w,'REPLACE')
  mod=o.modifiers.new('Articulated leg skin','ARMATURE');mod.object=rig;world=o.matrix_world.copy();o.parent=rig;o.matrix_world=world
 rig.animation_data_create();scene=bpy.context.scene;scene.render.fps=25
 def put(n,head,tail):
  rest=data.bones[n];rot=(rest.tail_local-rest.head_local).rotation_difference(tail-head).to_matrix().to_4x4();rig.pose.bones[n].matrix=Matrix.Translation(head)@rot@rest.matrix_local.to_quaternion().to_matrix().to_4x4();bpy.context.view_layer.update()
 def solve(side,phase):
  hip,knee,ankle,toe=anchors[side];phase%=1
  shift=(1-phase/.6*2)*.025*H if phase<.6 else (-1+(phase-.6)/.4*2)*.025*H
  lift=0 if phase<.6 else math.sin((phase-.6)/.4*math.pi)*.04*H
  target=ankle+Vector((0,shift,lift));v=target-hip;l1=(knee-hip).length;l2=(ankle-knee).length;dist=min(v.length,l1+l2-.00001);axis=v.normalized();target=hip+axis*dist
  along=(l1*l1-l2*l2+dist*dist)/(2*dist);bend=Vector((0,-1,0));bend=(bend-axis*bend.dot(axis)).normalized();joint=hip+axis*along+bend*math.sqrt(max(0,l1*l1-along*along))
  put('thigh.'+side,hip,joint);put('shin.'+side,joint,target);put('foot.'+side,target,target+toe-ankle)
 for clip in ('idle','walk_stopmotion','cast'):
  action=bpy.data.actions.new(clip);rig.animation_data.action=action
  for i,f in enumerate([1,5,9,13,17,21]):
   phase=(i%5)/5
   for p in rig.pose.bones:p.rotation_mode='XYZ';p.matrix_basis.identity()
   if clip=='walk_stopmotion':
    solve('L',phase);solve('R',phase+.5)
    rig.pose.bones['head'].rotation_euler.x=.055*math.sin(phase*math.tau*2);rig.pose.bones['head'].location.z=.015*H*math.sin(phase*math.tau*2)
   elif clip=='cast':rig.pose.bones['head'].rotation_euler.x=.09*math.sin(phase*math.tau)
   else:rig.pose.bones['head'].rotation_euler.z=.018*math.sin(phase*math.tau)
   for p in rig.pose.bones:
    p.keyframe_insert('location',frame=f);p.keyframe_insert('rotation_euler',frame=f);p.keyframe_insert('scale',frame=f)
  for layer in action.layers:
   for strip in layer.strips:
    for curve in strip.channelbag(action.slots[0]).fcurves:
     for k in curve.keyframe_points:k.interpolation='CONSTANT'
  t=rig.animation_data.nla_tracks.new();t.name=clip;t.strips.new(clip,1,action);t.mute=True;rig.animation_data.action=None
 for t in rig.animation_data.nla_tracks:t.mute=False
 scene.frame_set(1);target=out/(key+'-'+revision+'.glb');bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS')
 b=target.read_bytes();jl=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+jl]);tail=b[20+jl:]
 for a in g['animations']:
  for s in a['samplers']:s['interpolation']='STEP'
 j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);target.write_bytes(struct.pack('<III',0x46546c67,2,20+len(j)+len(tail))+struct.pack('<II',len(j),0x4e4f534a)+j+tail)
 for t in rig.animation_data.nla_tracks:t.mute=True
 bpy.ops.wm.save_as_mainfile(filepath=str(out/(key+'-'+revision+'.blend')))
else:rig=arms[0];scene=bpy.context.scene
# Render five held poses, with distinct magical action staging for the new guardians.
scene.render.engine='CYCLES';scene.cycles.samples=8;scene.render.resolution_x=448;scene.render.resolution_y=448;scene.render.resolution_percentage=100;scene.render.film_transparent=False
scene.world=bpy.data.worlds.new('Grove studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.075,.055,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for n,loc,power in [('Key',(4,-6,7),850),('Fill',(-4,-2,5),550),('Rim',(2,4,6),850)]:
 d=bpy.data.lights.new(n,'AREA');d.energy=power;d.size=4;o=bpy.data.objects.new(n,d);scene.collection.objects.link(o);o.location=Vector(loc)*H/2;o.rotation_euler=(Vector((cx,0,z(.5)))-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.cameras.new('Review');cam=bpy.data.objects.new('Review',d);scene.collection.objects.link(cam);scene.camera=cam;d.type='ORTHO';d.ortho_scale=H*1.55;cam.location=(cx+H*.7,-H*3,z(.62));cam.rotation_euler=(Vector((cx,0,z(.5)))-cam.location).to_track_quat('-Z','Y').to_euler()
fx=[];color={'lady':(.25,1,.7,1),'phil':(.1,.7,1,1),'reno':(.5,1,.08,1),'demon':(.65,.2,1,1)}.get(key,(.9,.7,.25,1))
if key in ('lady','phil','reno','demon','demon-action'):
 mat=bpy.data.materials.new('Gnome magic');mat.diffuse_color=color;mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=color;bs.inputs['Emission Color'].default_value=color;bs.inputs['Emission Strength'].default_value=2
 for j in range(12):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=H*.023);o=bpy.context.object;o.data.materials.append(mat);fx.append(o)
def activate(clip,f):
 rig.animation_data.action=None
 for t in rig.animation_data.nla_tracks:t.mute=True
 for p in rig.pose.bones:p.matrix_basis.identity()
 strip=next(t.strips[0] for t in rig.animation_data.nla_tracks if t.name==clip);rig.animation_data.action=strip.action;rig.animation_data.action_slot=strip.action_slot;scene.frame_set(f);bpy.context.view_layer.update()
for i in range(5):
 phase=i/5;pulse=math.sin(math.pi*phase)**2
 if walk:activate('walk_stopmotion',1+i*4)
 else:
  activate('cast',1+i*8)
  if 'torso' in rig.pose.bones:rig.pose.bones['torso'].rotation_euler.x+=(-.13 if key=='phil' else .06)*pulse
  rig.pose.bones['head'].rotation_euler.z+=.05*math.sin(phase*math.tau)
  rig.location.z=(H*.12*pulse if key=='phil' else 0)
 for j,o in enumerate(fx):
  a=j/12*math.tau+phase*math.tau;r=H*(.28+.16*pulse);o.location=(cx+math.cos(a)*r,-.15*H+math.sin(a)*r,z(.12)+H*((j%3)*.16+phase*.45));o.scale=(1,1,3 if key=='reno' else 1)
 bpy.context.view_layer.update();graph=bpy.context.evaluated_depsgraph_get();poses=[]
 for o in meshes:
  ev=o.evaluated_get(graph);m=ev.to_mesh();poses.extend([list(ev.matrix_world@v.co) for v in m.vertices]);ev.to_mesh_clear()
 assert all(math.isfinite(v) for p in poses for v in p)
 checks.append({'pose':i,'minZ':min(p[2] for p in poses),'maxZ':max(p[2] for p in poses)})
 scene.render.filepath=str(out/f'frame-{i}.png');bpy.ops.render.render(write_still=True)
(out/'receipt.json').write_text(json.dumps({'source':str(src),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'poses':5,'frameDelayMs':160,'credits':0,'articulatedLegs':walk,'checks':checks,'license':'LicenseRef-Hyper3D-Rodin-Terms','limitations':['Regional skinning fitted per model, not mocap retargeting','In-place five-pose stylized walk; no runtime foot IK']},indent=2))
