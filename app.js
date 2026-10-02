/* Student Intervention Log - vanilla JS, no dependencies. Data lives in localStorage. */
(function(){
var data={students:[]},view={page:'list',sid:null,q:'',editing:null,exp:null},store=null,LS='studentLog.v1';
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function lsGet(){try{var v=localStorage.getItem(LS);return v?JSON.parse(v):null}catch(e){return null}}
function lsSet(){try{localStorage.setItem(LS,JSON.stringify(data))}catch(e){}}
async function load(){
  var l=lsGet();if(l&&l.students)data=l;
  store='Saved in this browser (localStorage). Use Backup (JSON) regularly.';
}
async function save(){lsSet()}
function student(id){return data.students.find(function(s){return s.id===id})}
function hl(t){t=esc(t);if(!view.q)return t;var q=esc(view.q).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return t.replace(new RegExp('('+q+')','gi'),'<mark>$1</mark>')}
function matchI(i,q){return (i.type+' '+i.summary+' '+i.actions+' '+i.followup+' '+i.date).toLowerCase().indexOf(q)>-1}
function matchS(s,q){return (s.name+' '+s.grade+' '+s.notes).toLowerCase().indexOf(q)>-1}
function types(){return ['Academic','Behavior','Attendance','Social/Emotional','Family contact','Check-in','Other']}

function render(){
  $('#status').textContent=store||'';
  var h='';
  if(view.exp!==null){h=renderExport()}
  else if(view.page==='list')h=renderList();
  else h=renderStudent();
  $('#app').innerHTML=h;
}
function renderList(){
  var q=view.q.toLowerCase().trim(),h='';
  h+='<div class="row" style="margin-bottom:10px"><input type="search" id="q" class="grow" placeholder="Search students and all notes…" value="'+esc(view.q)+'">'
   +'<button class="p" data-a="newStu">+ New student</button></div>';
  if(view.adding){h+='<div class="card"><h2>New student</h2><label class="lbl">Name</label><input type="text" id="nn" style="width:100%">'
   +'<label class="lbl">Grade / class (optional)</label><input type="text" id="ng" style="width:100%">'
   +'<label class="lbl">Background notes (optional)</label><textarea id="nb"></textarea>'
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="saveStu">Save</button><button data-a="cancelStu">Cancel</button></div></div>'}
  var list=data.students.slice().sort(function(a,b){return a.name.localeCompare(b.name)});
  var shown=0;
  list.forEach(function(s){
    var hits=q?s.interventions.filter(function(i){return matchI(i,q)}):[];
    if(q&&!matchS(s,q)&&!hits.length)return;shown++;
    var last=s.interventions.map(function(i){return i.date}).sort().pop();
    var open=s.interventions.filter(function(i){return i.followup&&!i.done}).length;
    h+='<div class="card stu" data-a="open" data-id="'+s.id+'"><div><b>'+hl(s.name)+'</b> <span class="meta">'+hl(s.grade||'')+'</span>'
     +'<div class="meta">'+s.interventions.length+' interventions'+(last?' · last '+last:'')+'</div>'
     +(q&&hits.length?'<div class="meta">'+hits.length+' matching note(s)</div>':'')+'</div>'
     +(open?'<span class="tag fu">'+open+' follow-up</span>':'')+'</div>';
  });
  if(!shown)h+='<div class="meta">'+(data.students.length?'No matches.':'No students yet. Click “New student” to begin.')+'</div>';
  h+='<div class="row" style="margin-top:16px"><button data-a="expAll">Export all (Markdown)</button><button data-a="backup">Backup (JSON)</button><button data-a="restore">Restore JSON…</button></div>';
  return h;
}
function renderStudent(){
  var s=student(view.sid);if(!s){view.page='list';return renderList()}
  var q=view.q.toLowerCase().trim(),h='';
  h+='<div class="row" style="margin-bottom:10px"><button data-a="back">← All students</button><button data-a="expOne">Export history</button><button data-a="editStu">Edit student</button><button class="d" data-a="delStu">Delete</button></div>';
  if(view.editStu){h+='<div class="card"><label class="lbl">Name</label><input type="text" id="en" style="width:100%" value="'+esc(s.name)+'">'
   +'<label class="lbl">Grade / class</label><input type="text" id="eg" style="width:100%" value="'+esc(s.grade)+'">'
   +'<label class="lbl">Background notes</label><textarea id="eb">'+esc(s.notes)+'</textarea>'
   +'<div class="row" style="margin-top:8px"><button class="p" data-a="saveEditStu">Save</button><button data-a="cancelEditStu">Cancel</button></div></div>'}
  else h+='<div class="card"><h2>'+esc(s.name)+'</h2><div class="meta">'+esc(s.grade||'')+'</div>'+(s.notes?'<div class="note">'+esc(s.notes)+'</div>':'')+'</div>';
  var e=view.editing,cur=e&&e!=='new'?s.interventions.find(function(i){return i.id===e}):null;
  if(e){cur=cur||{date:today(),type:'Check-in',summary:'',actions:'',followup:'',done:false};
    h+='<div class="card"><h2>'+(e==='new'?'Log intervention':'Edit intervention')+'</h2><div class="row">'
     +'<div><label class="lbl">Date</label><input type="date" id="id" value="'+esc(cur.date)+'"></div>'
     +'<div><label class="lbl">Type</label><select id="it">'+types().map(function(t){return '<option'+(t===cur.type?' selected':'')+'>'+t+'</option>'}).join('')+'</select></div></div>'
     +'<label class="lbl">What happened / what was discussed</label><textarea id="is">'+esc(cur.summary)+'</textarea>'
     +'<label class="lbl">Actions taken / agreements</label><textarea id="ia" style="min-height:60px">'+esc(cur.actions)+'</textarea>'
     +'<label class="lbl">Follow-up needed (leave blank if none)</label><input type="text" id="if" style="width:100%" value="'+esc(cur.followup)+'">'
     +'<div class="row" style="margin-top:8px"><button class="p" data-a="saveInt">Save</button><button data-a="cancelInt">Cancel</button></div></div>';
  } else h+='<div style="margin-bottom:10px"><button class="p" data-a="newInt">+ Log intervention</button></div>';
  h+='<input type="search" id="q" style="width:100%;margin-bottom:10px" placeholder="Search this student’s notes…" value="'+esc(view.q)+'">';
  var ints=s.interventions.slice().sort(function(a,b){return b.date.localeCompare(a.date)||b.id.localeCompare(a.id)});
  if(q)ints=ints.filter(function(i){return matchI(i,q)});
  ints.forEach(function(i){
    h+='<div class="card"><div class="row" style="justify-content:space-between"><div><b>'+esc(i.date)+'</b> <span class="tag">'+esc(i.type)+'</span></div>'
     +'<div class="row"><button class="s" data-a="editInt" data-id="'+i.id+'">Edit</button><button class="s d" data-a="delInt" data-id="'+i.id+'">Delete</button></div></div>'
     +'<div class="note">'+hl(i.summary)+'</div>'
     +(i.actions?'<div class="meta">Actions:</div><div class="note">'+hl(i.actions)+'</div>':'')
     +(i.followup?'<div class="row"><span class="tag '+(i.done?'':'fu')+'">Follow-up: '+hl(i.followup)+(i.done?' ✓':'')+'</span><button class="s" data-a="toggleFu" data-id="'+i.id+'">'+(i.done?'Reopen':'Mark done')+'</button></div>':'')
     +'</div>';
  });
  if(!ints.length)h+='<div class="meta">'+(q?'No matching notes.':'No interventions logged yet.')+'</div>';
  return h;
}
function mdFor(s){
  var o='# '+s.name+'\n\n';
  if(s.grade)o+='**Grade/Class:** '+s.grade+'  \n';
  o+='**Total interventions:** '+s.interventions.length+'\n\n';
  if(s.notes)o+='## Background\n'+s.notes+'\n\n';
  o+='## Intervention History\n\n';
  var ints=s.interventions.slice().sort(function(a,b){return a.date.localeCompare(b.date)});
  if(!ints.length)o+='_No interventions logged._\n\n';
  ints.forEach(function(i){
    o+='### '+i.date+' — '+i.type+'\n\n'+i.summary+'\n\n';
    if(i.actions)o+='**Actions/agreements:** '+i.actions+'\n\n';
    if(i.followup)o+='**Follow-up:** '+i.followup+(i.done?' _(completed)_':' _(open)_')+'\n\n';
  });
  return o;
}
function fullMd(){
  var o='# Student Intervention Report\n\n_Generated '+today()+'_\n\n';
  data.students.slice().sort(function(a,b){return a.name.localeCompare(b.name)}).forEach(function(s){o+=mdFor(s).replace(/^#/gm,'##').replace(/^#{2}(#+)/gm,'$1#')+'\n---\n\n'});
  return o;
}
function renderExport(){
  return '<div class="row" style="margin-bottom:10px"><button data-a="closeExp">← Back</button><button class="p" data-a="copy">Copy</button><button data-a="dl">Download .md</button></div>'
   +'<textarea id="expta" style="min-height:60vh;font-family:ui-monospace,Menlo,monospace;font-size:13px">'+esc(view.exp)+'</textarea>';
}
async function saveFile(name,text){
  var type=/\.json$/.test(name)?'application/json':'text/markdown';
  var url=URL.createObjectURL(new Blob([text],{type:type+';charset=utf-8'}));
  var a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url)},1000);return true;
}
function copyText(t){
  var ta=$('#expta');ta.focus();ta.select();var ok=false;
  try{ok=document.execCommand('copy')}catch(e){}
  if(!ok&&navigator.clipboard){navigator.clipboard.writeText(t).catch(function(){})}
  $('#status').textContent=ok?'Copied to clipboard':'Text selected — press Ctrl/Cmd+C to copy';
}
document.addEventListener('input',function(e){
  if(e.target.id==='q'){view.q=e.target.value;var p=e.target.selectionStart;render();var q=$('#q');q.focus();try{q.setSelectionRange(p,p)}catch(x){}}
});
document.addEventListener('click',async function(e){
  var t=e.target.closest('[data-a]');if(!t)return;var a=t.dataset.a,id=t.dataset.id,s=student(view.sid);
  if(a==='newStu'){view.adding=true}
  else if(a==='cancelStu'){view.adding=false}
  else if(a==='saveStu'){var n=$('#nn').value.trim();if(!n){$('#nn').focus();return}
    var ns={id:uid(),name:n,grade:$('#ng').value.trim(),notes:$('#nb').value.trim(),interventions:[]};data.students.push(ns);view.adding=false;view.sid=ns.id;view.page='student';view.q='';await save()}
  else if(a==='open'){view.sid=id;view.page='student'}
  else if(a==='back'){view.page='list';view.editing=null;view.editStu=false;view.q=''}
  else if(a==='editStu'){view.editStu=true}
  else if(a==='cancelEditStu'){view.editStu=false}
  else if(a==='saveEditStu'){var nm=$('#en').value.trim();if(!nm)return;s.name=nm;s.grade=$('#eg').value.trim();s.notes=$('#eb').value.trim();view.editStu=false;await save()}
  else if(a==='delStu'){if(confirm('Delete '+s.name+' and all their interventions? This cannot be undone.')){data.students=data.students.filter(function(x){return x!==s});view.page='list';await save()}}
  else if(a==='newInt'){view.editing='new'}
  else if(a==='editInt'){view.editing=id}
  else if(a==='cancelInt'){view.editing=null}
  else if(a==='saveInt'){var sm=$('#is').value.trim();if(!sm){$('#is').focus();return}
    var rec={date:$('#id').value||today(),type:$('#it').value,summary:sm,actions:$('#ia').value.trim(),followup:$('#if').value.trim()};
    if(view.editing==='new'){rec.id=uid();rec.done=false;s.interventions.push(rec)}
    else{var o=s.interventions.find(function(i){return i.id===view.editing});Object.assign(o,rec)}
    view.editing=null;await save()}
  else if(a==='delInt'){if(confirm('Delete this intervention?')){s.interventions=s.interventions.filter(function(i){return i.id!==id});await save()}}
  else if(a==='toggleFu'){var i2=s.interventions.find(function(i){return i.id===id});i2.done=!i2.done;await save()}
  else if(a==='expOne'){view.exp=mdFor(s);view.expName=s.name.replace(/\W+/g,'_')+'_history.md'}
  else if(a==='expAll'){view.exp=fullMd();view.expName='all_students_history.md'}
  else if(a==='closeExp'){view.exp=null}
  else if(a==='copy'){copyText($('#expta').value);return}
  else if(a==='dl'){var ok=await saveFile(view.expName,$('#expta').value);if(!ok)copyText($('#expta').value);return}
  else if(a==='backup'){view.exp=JSON.stringify(data,null,2);view.expName='student_log_backup.json'}
  else if(a==='restore'){var j=prompt('Paste the JSON backup here. This REPLACES current data.');
    if(j){try{var p=JSON.parse(j);if(!p.students)throw 0;data=p;await save()}catch(x){alert('That is not a valid backup.')}}}
  render();
});
load().then(render);
})();
