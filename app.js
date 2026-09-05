const PARAMS={learn:.12,slip:.10,guess:.20};
const QUESTIONS=[
{topic:'Matrices',difficulty:'easy',q:'If A is a 2×3 matrix and B is a 3×4 matrix, what is the order of AB?',options:['2×4','3×3','2×3','4×2'],answer:0,explain:'The inner dimensions 3 and 3 match, so the product keeps the outer dimensions: 2×4.'},
{topic:'Matrices',difficulty:'medium',q:'For a square matrix A, which statement about the identity matrix I is always true?',options:['AI = I','AI = A','A + I = A','I = 0'],answer:1,explain:'The identity matrix leaves a compatible matrix unchanged under multiplication: AI = IA = A.'},
{topic:'Matrices',difficulty:'hard',q:'A 2×2 matrix has determinant 0. What can you conclude?',options:['It is the identity matrix','It has no inverse','Every entry is 0','Its trace is 0'],answer:1,explain:'A square matrix is invertible exactly when its determinant is non-zero.'},
{topic:'C Logic',difficulty:'easy',q:'Which control structure is best when the same block must repeat while a condition remains true?',options:['Loop','Comment','Header','Constant'],answer:0,explain:'A loop repeatedly executes a block while its continuation condition holds.'},
{topic:'C Logic',difficulty:'medium',q:'An algorithm must eventually stop after a finite number of steps. Which characteristic is this?',options:['Definiteness','Finiteness','Input','Effectiveness'],answer:1,explain:'Finiteness means an algorithm terminates after a finite number of steps.'},
{topic:'C Logic',difficulty:'hard',q:'To reverse the decimal digits of an integer n, which value extracts its last digit?',options:['n / 10','n % 10','n * 10','10 % n'],answer:1,explain:'Remainder after division by 10 gives the final decimal digit: n % 10.'},
{topic:'Motion',difficulty:'easy',q:'In uniform circular motion, the centripetal force points in which direction?',options:['Tangentially forward','Away from the centre','Toward the centre','Vertically upward'],answer:2,explain:'Centripetal means centre-seeking, so the net radial force points toward the centre of the circle.'},
{topic:'Motion',difficulty:'medium',q:'Two points lie on the same rigid rotating disc. Which quantity is the same for both?',options:['Linear speed','Angular velocity','Distance travelled','Centripetal acceleration'],answer:1,explain:'All points on a rigid body share the same angular velocity, while linear speed increases with radius.'},
{topic:'Motion',difficulty:'hard',q:'If the speed of an object in circular motion doubles while radius stays fixed, centripetal acceleration becomes…',options:['Half as large','Twice as large','Four times as large','Unchanged'],answer:2,explain:'Centripetal acceleration is v²/r, so doubling v multiplies acceleration by 4.'},
{topic:'Statistics',difficulty:'easy',q:'What does the range of a dataset measure?',options:['Middle value','Spread from minimum to maximum','Most frequent value','Average squared deviation'],answer:1,explain:'Range is maximum minus minimum, a simple measure of dispersion.'},
{topic:'Statistics',difficulty:'medium',q:'Which expression gives the mean of a discrete frequency distribution?',options:['Σx / Σf','Σfx / Σf','Σf / Σx','Σfx / n²'],answer:1,explain:'Each value is weighted by its frequency, so mean = Σfx / Σf.'},
{topic:'Statistics',difficulty:'hard',q:'If every observation in a dataset increases by 5, what happens to its standard deviation?',options:['It increases by 5','It decreases by 5','It stays the same','It doubles'],answer:2,explain:'Adding a constant shifts the whole distribution without changing distances from the mean.'}
];
const TOPICS=[...new Set(QUESTIONS.map(q=>q.topic))];
let state;
const $=id=>document.getElementById(id);
const entropy=p=>p<=0||p>=1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));
const pct=p=>`${Math.round(p*100)}%`;

function freshState(){return{mastery:Object.fromEntries(TOPICS.map((t,i)=>[t,.28+i*.025])),asked:[],history:[],trajectory:[],confidence:3,current:null,baseline:null};}
function difficultyTarget(p){if(p<.42)return'easy';if(p<.72)return'medium';return'hard';}
function bktUpdate(prior,correct){
 const {learn,slip,guess}=PARAMS;
 const likelihood=correct?(1-slip):slip;
 const alt=correct?guess:(1-guess);
 const posterior=(prior*likelihood)/(prior*likelihood+(1-prior)*alt);
 return posterior+(1-posterior)*learn;
}
function predictedCorrect(p){return p*(1-PARAMS.slip)+(1-p)*PARAMS.guess;}
function expectedPosteriorEntropy(p){
 const pc=predictedCorrect(p);
 const c=bktUpdate(p,true), w=bktUpdate(p,false);
 return pc*entropy(c)+(1-pc)*entropy(w);
}
function infoGain(p){return Math.max(0,entropy(p)-expectedPosteriorEntropy(p));}
function questionUtility(q){
 const p=state.mastery[q.topic];
 const uncertainty=4*p*(1-p);
 const target=difficultyTarget(p);
 const match=q.difficulty===target?1:q.difficulty==='medium'?.72:.54;
 const novelty=state.asked.includes(QUESTIONS.indexOf(q))?0:1;
 return novelty*(.48*uncertainty+.37*Math.min(1,infoGain(p)*4)+.15*match);
}
function chooseQuestion(){
 const available=QUESTIONS.filter((_,i)=>!state.asked.includes(i));
 if(!available.length){state.asked=[];return chooseQuestion();}
 const ranked=available.map(q=>({q,u:questionUtility(q)})).sort((a,b)=>b.u-a.u);
 const current=ranked[0].q, idx=QUESTIONS.indexOf(current), p=state.mastery[current.topic];
 state.current=idx;
 renderQuestion(current,p,ranked[0].u);
}
function renderQuestion(q,p,utility){
 $('topicBadge').textContent=q.topic;$('difficultyBadge').textContent=q.difficulty;
 $('questionText').textContent=q.q;
 $('options').innerHTML=q.options.map((o,i)=>`<button class="option" data-i="${i}"><span class="letter">${String.fromCharCode(65+i)}</span>${escapeHtml(o)}</button>`).join('');
 document.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>answer(Number(btn.dataset.i))));
 $('feedback').className='feedback hidden';$('nextBtn').classList.add('hidden');
 $('uncertainty').textContent=(4*p*(1-p)).toFixed(2);
 $('priorMastery').textContent=pct(p);$('expectedInfo').textContent=infoGain(p).toFixed(2)+' bits';
 $('decisionReason').textContent=`${q.topic} is currently ${pct(p)} mastered. A ${q.difficulty} question best balances uncertainty, difficulty match, and expected information gain.`;
}
function answer(selected){
 const q=QUESTIONS[state.current]; if(state.asked.includes(state.current))return;
 const correct=selected===q.answer, prior=state.mastery[q.topic], after=bktUpdate(prior,correct);
 state.mastery[q.topic]=after;state.asked.push(state.current);
 const record={step:state.history.length+1,topic:q.topic,difficulty:q.difficulty,question:q.q,selected,correct,confidence:state.confidence,prior,posterior:after,delta:after-prior,infoGain:infoGain(prior)};
 state.history.unshift(record);state.trajectory.push({step:record.step,topic:q.topic,mastery:after,correct});
 document.querySelectorAll('.option').forEach((btn,i)=>{btn.disabled=true;if(i===q.answer)btn.classList.add('correct');if(i===selected&&!correct)btn.classList.add('wrong');});
 $('feedback').className='feedback '+(correct?'good':'bad');
 $('feedback').innerHTML=`<b>${correct?'Correct.':'Not quite.'}</b> ${escapeHtml(q.explain)} <span>Model update: ${pct(prior)} → ${pct(after)}.</span>`;
 $('nextBtn').classList.remove('hidden');renderState();
}
function renderState(){
 $('masteryList').innerHTML=TOPICS.map(t=>`<div class="mastery-row"><div class="mastery-top"><span>${escapeHtml(t)}</span><b>${pct(state.mastery[t])}</b></div><div class="track"><div class="fill" style="width:${pct(state.mastery[t])}"></div></div></div>`).join('');
 const n=state.history.length, correct=state.history.filter(x=>x.correct).length;
 $('answered').textContent=n;$('accuracy').textContent=n?pct(correct/n):'—';
 const avg=Object.values(state.mastery).reduce((a,b)=>a+b,0)/TOPICS.length;
 $('gain').textContent=(n?`${Math.round((avg-state.baseline)*100)}%`:'0%');
 $('history').innerHTML=n?state.history.map(h=>`<div class="history-item"><i class="history-dot ${h.correct?'':'bad'}"></i><div><b>${escapeHtml(h.topic)} · ${h.correct?'correct':'incorrect'}</b><span>${pct(h.prior)} → ${pct(h.posterior)} · confidence ${h.confidence}/5</span></div><em>${h.delta>=0?'+':''}${Math.round(h.delta*100)}pp</em></div>`).join(''):'<div class="empty">No decisions yet.</div>';
 $('beliefChart').innerHTML=state.trajectory.length?state.trajectory.map(h=>`<div class="bar-col"><div class="bar-wrap"><div class="bar" style="height:${Math.max(3,h.mastery*100)}%"></div></div><b>${Math.round(h.mastery*100)}%</b><span>${escapeHtml(h.topic.slice(0,4))}</span></div>`).join(''):'<div class="empty">Answer a question to create the mastery trajectory.</div>';
}
function next(){chooseQuestion();}
function reset(){state=freshState();state.baseline=Object.values(state.mastery).reduce((a,b)=>a+b,0)/TOPICS.length;renderState();chooseQuestion();}
function exportSession(){
 const payload={model:'Bayesian Knowledge Tracing',parameters:PARAMS,exportedAt:new Date().toISOString(),mastery:state.mastery,history:[...state.history].reverse()};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='masterymap-session.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),400);
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
$('confidence').addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')return;state.confidence=Number(e.target.dataset.c);document.querySelectorAll('#confidence button').forEach(b=>b.classList.toggle('active',b===e.target));});
$('nextBtn').addEventListener('click',next);$('resetBtn').addEventListener('click',reset);$('exportBtn').addEventListener('click',exportSession);
reset();
