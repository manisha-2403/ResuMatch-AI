/* ================= ENGINE ================= */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rxEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const SK={
 python:['Python','Language',['python']],
 sql:['SQL','Data',['sql','mysql','postgresql','postgres','sqlite']],
 r:['R','Language',['r programming','r language','rstudio']],
 js:['JavaScript','Web',['javascript','es6']],
 ts:['TypeScript','Web',['typescript']],
 numpy:['NumPy','Library',['numpy']],
 pandas:['Pandas','Library',['pandas']],
 sklearn:['scikit-learn','ML',['scikit-learn','sklearn','scikit learn']],
 dlfw:['PyTorch / TensorFlow','DL',['pytorch','torch','tensorflow','keras']],
 ml:['Machine learning','ML',['machine learning','ml']],
 dl:['Deep learning','DL',['deep learning','neural network','neural networks','cnn','rnn','lstm']],
 nlp:['NLP','NLP',['nlp','natural language processing','text classification','sentiment analysis']],
 llm:['LLMs / GenAI','NLP',['llm','llms','large language model','generative ai','genai','langchain','rag','prompt engineering','openai']],
 hf:['Hugging Face','NLP',['hugging face','huggingface','transformers','bert']],
 cv:['Computer vision','CV',['computer vision','opencv','object detection','image classification','yolo']],
 stats:['Statistics','Foundations',['statistics','statistical','hypothesis testing','regression','probability','a/b testing']],
 fe:['Feature engineering','ML',['feature engineering','feature selection','tf-idf','tfidf']],
 eval:['Model evaluation','ML',['cross-validation','cross validation','precision','recall','f1','roc','auc','hyperparameter']],
 eda:['Data cleaning / EDA','Data',['data cleaning','data preprocessing','preprocessing','data wrangling','eda','exploratory data analysis']],
 viz:['Data visualization','Data',['matplotlib','seaborn','plotly','data visualization','visualization','visualisation','visualizations']],
 git:['Git','Tools',['git','github','gitlab']],
 docker:['Docker','Deploy',['docker','containerized','containerised']],
 k8s:['Kubernetes','Deploy',['kubernetes','k8s']],
 aws:['AWS','Cloud',['aws','amazon web services','sagemaker','ec2','s3']],
 gcp:['GCP','Cloud',['gcp','google cloud','vertex ai']],
 azure:['Azure','Cloud',['azure']],
 mlops:['MLOps','Deploy',['mlops','mlflow','ci/cd','model deployment','kubeflow','model serving']],
 flask:['Flask / FastAPI','Backend',['flask','fastapi','django']],
 api:['REST APIs','Backend',['rest api','rest apis','restful','api','apis']],
 streamlit:['Streamlit','Tools',['streamlit','gradio']],
 tableau:['Tableau / Power BI','BI',['tableau','power bi','powerbi','looker']],
 excel:['Excel','BI',['excel','spreadsheets']],
 spark:['Spark / Big data','Data',['spark','pyspark','hadoop','databricks','big data']],
 airflow:['Airflow / ETL','Data',['airflow','etl','data pipeline','data pipelines']],
 react:['React','Web',['react','react.js','reactjs','next.js']],
 node:['Node.js','Web',['node.js','nodejs']],
 html:['HTML / CSS','Web',['html','css','tailwind']],
 mongo:['MongoDB / NoSQL','Data',['mongodb','nosql']],
 linux:['Linux / Shell','Tools',['linux','bash','shell scripting']],
 dsa:['Data structures & algorithms','Foundations',['data structures','algorithms']],
 testing:['Testing','Tools',['unit testing','pytest','jest','test-driven','tdd']],
 agile:['Agile','Process',['agile','scrum','jira']],
 research:['Research / papers','Foundations',['research paper','published','ieee','arxiv','research'] ]
};
const ROLES={
 ml:{label:'AI / ML Engineer',core:['python','ml','sklearn','dlfw','dl','pandas','numpy','eval','git','stats'],
     use:['nlp','llm','hf','cv','docker','mlops','aws','flask','sql','eda','viz','dsa','research','linux','streamlit']},
 ds:{label:'Data Scientist',core:['python','sql','pandas','numpy','stats','ml','sklearn','eda','viz','eval'],
     use:['r','tableau','spark','fe','git','airflow','aws','excel','nlp','dl']},
 da:{label:'Data Analyst',core:['sql','excel','tableau','python','pandas','viz','stats','eda'],
     use:['r','numpy','git','airflow','spark','aws','agile']},
 fs:{label:'Full-Stack Developer',core:['js','ts','react','node','html','api','sql','git'],
     use:['mongo','docker','aws','testing','linux','agile','python','flask','dsa','k8s']}
};
const SKRX={};
for(const id in SK){
  const al=SK[id][2].slice().sort((a,b)=>b.length-a.length).map(rxEsc);
  SKRX[id]=new RegExp('(?<![a-z0-9+#])(?:'+al.join('|')+')(?![a-z0-9+#])','gi');
}
const mkList=(arr)=>new RegExp('(?<![a-z0-9])(?:'+arr.slice().sort((a,b)=>b.length-a.length).map(rxEsc).join('|')+')(?![a-z0-9])','gi');
const WEAK=['responsible for','in charge of','worked on','worked with','helped with','helped','assisted in','assisted with','assisted','involved in','participated in','tasked with','duties included','handled','various','etc'];
const CLICHE=['team player','hard-working','hardworking','hard working','go-getter','self-motivated','detail-oriented','results-driven','results-oriented','passionate','fast learner','quick learner','excellent communication skills','think outside the box','synergy','dynamic'];
const WEAKRX=mkList(WEAK), CLICHERX=mkList(CLICHE);
const METRIC=/(?:[$₹€£]\s?\d[\d,]*(?:\.\d+)?\s?(?:k|m|b|lakh|crore|cr)?(?![a-z])|\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?x\b|\b\d[\d,]*\+?\s(?:users|customers|records|samples|images|models|requests|projects|datasets|rows|clients|students|messages|reviews|documents|classes|features|endpoints|ms|seconds|hours|days|queries|pipelines|tickets)\b)/gi;
function stem(w){
  w=w.toLowerCase(); if(w.length<4) return w;
  return w.replace(/ies$/,'y').replace(/(ing|ed|ly)$/,'').replace(/([^aeious])\1$/,'$1').replace(/e$/,'').replace(/([^s])s$/,'$1');
}
const STRONG=new Set(('built build develop design implement train deploy optimize optimise reduce increase improve automate lead create engineer analyze analyse achieve launch migrate scale integrate evaluate fine-tune architect deliver streamline accelerate research mentor collaborate clean visualize visualise forecast benchmark containerize publish present write wrote manage drive drove spearhead establish orchestrate refactor debug tune curate extract transform parse scrape classify predict model construct enhance resolve boost cut generate produce validate test ship maintain led ran compare conduct apply secure win organize organise coordinate teach').split(' ').map(stem));
const STOP=new Set(('a an the and or but if then of to in on for with at by from as is are was were be been being this that these those it its i you he she we they them our your their my me not no yes can could should would will may might must do does did done have has had having also into over under about than so such very more most other some any all each both few many much own same just only out up down off again further once here there when where why how what which who whom while during before after above below between through per via within without across among etc').split(' '));
const JDSTOP=new Set(('experience work team ability strong required preferred responsibilities role job candidate candidates looking join including will skills knowledge years year plus excellent good great environment company position opportunity requirements qualifications must working across build building help support using use used new high impact ideal bachelor degree related field equivalent minimum benefits apply need needs seeking strongly familiarity understanding').split(' '));
const SECTION_RE={
 summary:/^(professional\s+)?(summary|profile|objective|career objective|about( me)?)$/i,
 experience:/^((work|professional|relevant)\s+)?(experience|employment( history)?|internships?)$/i,
 education:/^(education|academic( background| qualifications)?)$/i,
 skills:/^((technical|key|core)\s+)?(skills|competencies|technologies|tech stack)(\s*&\s*tools)?$/i,
 projects:/^((academic|personal|selected|key)\s+)?projects$/i,
 certs:/^(certifications?|certificates|courses|licenses?)(\s*&\s*courses)?$/i,
 awards:/^(achievements|awards|honou?rs|publications|extracurriculars?|activities)$/i
};
const SECNAME={summary:'Summary',experience:'Experience',education:'Education',skills:'Skills',projects:'Projects',certs:'Certifications',awards:'Achievements'};
function headingOf(ln){
  const s=ln.trim().replace(/[:：]\s*$/,'').replace(/^[#*_\s]+|[#*_\s]+$/g,'');
  if(!s||s.length>40) return null;
  for(const k in SECTION_RE) if(SECTION_RE[k].test(s)) return k;
  return null;
}
const BULLET=/^\s*([-•*▪●◦–—]|\d+[.)])\s+/;
const CONTACTLINE=/@|https?:|www\.|linkedin\.com|github\.com/i;
const LEADS=[
 [/^(responsible for|in charge of|tasked with)\s+/i,'Owned '],
 [/^worked on\s+(?:a |an |the )?/i,'Built a '],
 [/^worked with\s+/i,'Used '],
 [/^(helped|assisted)(?: with| in| to)?\s+/i,'Supported '],
 [/^(involved in|participated in)\s+/i,'Contributed to ']
];

function matchesIn(line,rx){const out=[];rx.lastIndex=0;let m;while((m=rx.exec(line))){if(!m[0].length){rx.lastIndex++;continue}out.push([m.index,m.index+m[0].length]);}return out;}

function hint(id){
  const [label,cat]=SK[id];
  if(cat==='Foundations') return `Name a course, project or paper where you used ${label.toLowerCase()}.`;
  if(cat==='Cloud'||cat==='Deploy') return `Ship one project with ${label} and say so: "Deployed … on ${label}, serving … requests".`;
  return `Use it in a project bullet: "Built … with ${label}, improving … by …%".`;
}

function analyze(text,roleId,jd){
  const role=ROLES[roleId]||ROLES.ml;
  const lines=text.split(/\r?\n/);
  let cur='header'; const secOf=[]; const headAt={};
  lines.forEach((ln,i)=>{const h=headingOf(ln); if(h){cur=h;headAt[i]=h;} secOf.push(cur);});
  const present=new Set(Object.values(headAt));

  // per-line marks + skill tally
  const found={}; const marks=[]; let metricLines=0;
  lines.forEach((ln,i)=>{
    const ms=[]; if(headAt[i]!==undefined){marks.push(ms);return;}
    if(!CONTACTLINE.test(ln)){
      for(const id in SK){
        for(const [s,e] of matchesIn(ln,SKRX[id])){
          ms.push({s,e,t:'s',id});
          const f=found[id]||(found[id]={n:0,secs:new Set()}); f.n++; f.secs.add(secOf[i]);
        }
      }
      for(const [s,e] of matchesIn(ln,METRIC)) ms.push({s,e,t:'n'});
    }
    for(const [s,e] of matchesIn(ln,WEAKRX)) ms.push({s,e,t:'w',kind:'weak'});
    for(const [s,e] of matchesIn(ln,CLICHERX)) ms.push({s,e,t:'w',kind:'cliche'});
    ms.sort((a,b)=>a.s-b.s||(b.e-b.s)-(a.e-a.s));
    const keep=[];let end=-1;for(const m of ms){if(m.s>=end){keep.push(m);end=m.e;}}
    marks.push(keep);
  });

  const allMarks=marks.flat();
  const weak=allMarks.filter(m=>m.kind==='weak').length;
  const cliche=allMarks.filter(m=>m.kind==='cliche').length;

  // bullets
  let bl=[];
  lines.forEach((ln,i)=>{ if(BULLET.test(ln)) bl.push({i,text:ln.replace(BULLET,'').trim()}); });
  if(bl.length<3){
    bl=[];
    lines.forEach((ln,i)=>{
      if(headAt[i]!==undefined||CONTACTLINE.test(ln)) return;
      const t=ln.trim(); const wc=t.split(/\s+/).length;
      if((['experience','projects'].includes(secOf[i])&&wc>=8)||(/[.!]$/.test(t)&&wc>=8&&secOf[i]!=='summary')) bl.push({i,text:t});
    });
  }
  const nB=bl.length;
  const info=bl.map(b=>{
    const fw=(b.text.match(/^[a-z][a-z-]*/i)||[''])[0];
    const weakLead=LEADS.some(([re])=>re.test(b.text));
    const strong=!!fw&&STRONG.has(stem(fw))&&!weakLead;
    METRIC.lastIndex=0; const metric=METRIC.test(b.text); METRIC.lastIndex=0;
    return {...b,fw,strong,weakLead,metric,words:b.text.split(/\s+/).length};
  });
  const strongN=info.filter(b=>b.strong).length;
  const metricN=info.filter(b=>b.metric).length;

  // text stats
  const words=text.split(/\s+/).filter(w=>/[a-z0-9]/i.test(w)).length;
  const fp=(text.match(/\b(I'm|I've|I)\b/g)||[]).length+(text.match(/\b(my|me|myself)\b/gi)||[]).length;
  const avgB=nB?info.reduce((a,b)=>a+b.words,0)/nB:0;

  // contact
  const c={email:/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text),phone:/\+?\d[\d\s().-]{8,}\d/.test(text),
           linkedin:/linkedin/i.test(text),github:/github\.com\/[\w-]+/i.test(text)};
  const contactScore=(c.email?35:0)+(c.phone?25:0)+(c.linkedin?20:0)+(c.github?20:0);

  // skills
  const coreFound=role.core.filter(id=>found[id]), coreMiss=role.core.filter(id=>!found[id]);
  const useFound=role.use.filter(id=>found[id]), useMiss=role.use.filter(id=>!found[id]);
  const cov=(3*coreFound.length+useFound.length)/(3*role.core.length+role.use.length);
  const roleScore=clamp(cov/0.9*100,0,100);

  // job description
  let jdInfo=null;
  if(jd&&jd.trim().length>40){
    const toks=(jd.toLowerCase().match(/[a-z][a-z+#]{1,}/g)||[]);
    const tf={},surf={};
    toks.forEach(t=>{if(STOP.has(t)||JDSTOP.has(t)||t.length<3)return;const s=stem(t);tf[s]=(tf[s]||0)+1;(surf[s]||(surf[s]={}))[t]=(surf[s][t]||0)+1;});
    const top=Object.entries(tf).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,25);
    const rset={};(text.toLowerCase().match(/[a-z][a-z+#]{1,}/g)||[]).forEach(t=>{const s=stem(t);rset[s]=(rset[s]||0)+1;});
    let tot=0,hit=0;top.forEach(([s,n])=>{tot+=n;if(rset[s])hit+=n;});
    const termCov=tot?hit/tot:0;
    const jdSk=Object.keys(SK).filter(id=>{SKRX[id].lastIndex=0;const r=SKRX[id].test(jd);SKRX[id].lastIndex=0;return r;});
    const jdSkHave=jdSk.filter(id=>found[id]), jdSkMiss=jdSk.filter(id=>!found[id]);
    const skCov=jdSk.length?jdSkHave.length/jdSk.length:null;
    const match=skCov===null?termCov:0.6*skCov+0.4*termCov;
    const skillTerms=new Set();jdSk.forEach(id=>SK[id][2].forEach(a=>a.split(/[^a-z+#]+/).forEach(p=>skillTerms.add(stem(p)))));
    const missTerms=top.filter(([s])=>!rset[s]&&!skillTerms.has(s)).slice(0,12).map(([s])=>Object.entries(surf[s]).sort((a,b)=>b[1]-a[1])[0][0]);
    // cosine similarity of stem term-frequency vectors
    let dot=0,na=0,nb=0;for(const s in tf){na+=tf[s]*tf[s];if(rset[s])dot+=tf[s]*rset[s];}for(const s in rset)nb+=rset[s]*rset[s];
    const cosine=na&&nb?dot/Math.sqrt(na*nb):0;
    jdInfo={match:Math.round(match*100),cosine:Math.round(cosine*100),jdSk,jdSkHave,jdSkMiss,missTerms,termCov:Math.round(termCov*100)};
  }
  const kwScore=jdInfo?0.5*roleScore+0.5*clamp(jdInfo.match/75*100,0,100):roleScore;

  // sub-scores
  const impact=nB?clamp(metricN/nB/0.5*100,0,100):10;
  const verbRatio=nB?strongN/nB:0.3;
  const lang=clamp(20+80*verbRatio-Math.min(20,weak*4)-Math.min(12,cliche*3)-Math.min(12,fp*3),0,100);
  const hasWork=present.has('experience')||present.has('projects');
  const structure=(present.has('skills')?25:0)+(present.has('education')?25:0)+(hasWork?30:0)+(present.has('summary')?10:0)+((present.has('certs')||present.has('awards'))?10:0);
  let lenS=words<350?words/350*100:words<=750?100:words<=1000?100-(words-750)/250*30:40-clamp((words-1000)/10,0,30);
  let readS=!nB?60:(avgB>=8&&avgB<=26?100:avgB<8?60:clamp(100-(avgB-26)*5,20,100));
  const lenRead=clamp(0.6*lenS+0.4*readS,0,100);

  const W={kw:30,impact:20,lang:15,structure:15,contact:10,len:10};
  const subs={kw:kwScore,impact,lang,structure,contact:contactScore,len:lenRead};
  const total=Object.keys(W).reduce((a,k)=>a+subs[k]*W[k]/100,0);
  const rating=clamp(+(total/10).toFixed(1),1,10);

  const names={kw:'Skills match',impact:'Impact & numbers',lang:'Language',structure:'Structure',contact:'Contact & links',len:'Length & readability'};
  const notes={
    kw:`${coreFound.length}/${role.core.length} core skills for ${role.label}`+(jdInfo?`, ${jdInfo.match}% job post match`:''),
    impact:nB?`${metricN} of ${nB} bullets carry a number`:'No bullet points found',
    lang:nB?`${strongN} of ${nB} bullets open with a strong verb`+(weak?`, ${weak} weak phrase${weak>1?'s':''}`:''):'No bullet points found',
    structure:`Sections found: ${[...present].map(k=>SECNAME[k]).join(', ')||'none'}`,
    contact:`Missing: ${[!c.email&&'email',!c.phone&&'phone',!c.linkedin&&'LinkedIn',!c.github&&'GitHub'].filter(Boolean).join(', ')||'nothing'}`,
    len:`${words} words`+(nB?`, bullets average ${Math.round(avgB)} words`:'')
  };
  const rows=Object.keys(W).map(k=>({k,name:names[k],w:W[k],score:Math.round(subs[k]),note:notes[k],gain:(100-subs[k])*W[k]/1000}));
  const best=rows.slice().sort((a,b)=>b.score-a.score)[0], worst=rows.slice().sort((a,b)=>b.gain-a.gain)[0];

  // unproven skills: only in the skills list
  const unproven=Object.keys(found).filter(id=>[...found[id].secs].every(s=>s==='skills')).map(id=>SK[id][0]);

  // fixes
  const fixes=[];
  if(coreMiss.length>=1) fixes.push({sev:coreMiss.length>=3?'hi':'md',t:`Show ${coreMiss.length} missing core skill${coreMiss.length>1?'s':''} for ${role.label}`,
    b:`${coreMiss.slice(0,4).map(id=>SK[id][0]).join(', ')}${coreMiss.length>4?' and more':''}. Only list skills you have used, and put each one inside a project or job bullet.`});
  if(nB&&metricN/nB<0.5) fixes.push({sev:metricN/nB<0.3?'hi':'md',t:'Add numbers to your bullets',b:`Only ${metricN} of ${nB} bullets contain a measurable result. Add sizes, accuracy, time saved or users reached, for example "97% accuracy on 5,572 messages".`});
  if(!nB) fixes.push({sev:'hi',t:'Write achievements as bullet points',b:'No bullets were detected. ATS parsers and recruiters both skim short lines that start with a verb and end with a result.'});
  if(unproven.length) fixes.push({sev:'md',t:'Back up skills that only appear in your Skills list',b:`${unproven.slice(0,5).join(', ')}. Recruiters trust a skill more when a project bullet shows it in use.`});
  if(weak) fixes.push({sev:'md',t:`Replace ${weak} weak phrase${weak>1?'s':''}`,b:'Phrases such as "worked on", "responsible for" and "helped" hide what you actually did. Open each bullet with a verb like Built, Trained, Deployed or Reduced.'});
  if(nB&&strongN/nB<0.6&&!weak) fixes.push({sev:'md',t:'Start more bullets with an action verb',b:`${strongN} of ${nB} bullets open with a strong verb.`});
  if(cliche) fixes.push({sev:'lo',t:`Cut ${cliche} cliché${cliche>1?'s':''}`,b:'Words like "passionate", "team player" and "fast learner" are claims without proof. Replace them with a result or remove them.'});
  if(fp) fixes.push({sev:'lo',t:'Remove first-person wording',b:'Résumés read better without "I" and "my". Start sentences with the action.'});
  if(!c.github) fixes.push({sev:roleId==='da'?'lo':'hi',t:'Add a GitHub link',b:'Technical recruiters open it first. Pin two or three projects with a clear README.'});
  if(!c.linkedin) fixes.push({sev:'md',t:'Add your LinkedIn URL',b:'Most recruiters cross-check it before they call.'});
  if(!c.email||!c.phone) fixes.push({sev:'hi',t:'Add full contact details',b:`Missing ${[!c.email&&'email',!c.phone&&'phone number'].filter(Boolean).join(' and ')}. Put them in the first two lines as plain text.`});
  if(!present.has('skills')) fixes.push({sev:'hi',t:'Add a Skills section',b:'ATS parsers look for a heading named Skills or Technical Skills and read the keywords under it.'});
  if(!present.has('education')) fixes.push({sev:'hi',t:'Add an Education section',b:'Include degree, institution and years.'});
  if(!hasWork) fixes.push({sev:'hi',t:'Add Projects or Experience',b:'Without one of these there is nothing to prove your skills against.'});
  if(!present.has('summary')) fixes.push({sev:'lo',t:'Open with a two-line summary',b:`State the role you want and your two strongest skills, for example "${role.label} with hands-on ${role.core.slice(0,2).map(id=>SK[id][0]).join(' and ')} projects".`});
  if(words<350) fixes.push({sev:'md',t:'Add more detail',b:`${words} words is short. Aim for 400 to 650 words on one page.`});
  if(words>800) fixes.push({sev:'md',t:'Trim to one or two pages',b:`${words} words is long. Cut older or minor items first.`});
  if(nB&&avgB>28) fixes.push({sev:'lo',t:'Shorten long bullets',b:`Bullets average ${Math.round(avgB)} words. Keep them under 25.`});
  if(jdInfo&&jdInfo.jdSkMiss.length) fixes.push({sev:'hi',t:'Cover the skills the job post asks for',b:`Missing from your résumé: ${jdInfo.jdSkMiss.slice(0,5).map(id=>SK[id][0]).join(', ')}.`});
  const order={hi:0,md:1,lo:2}; fixes.sort((a,b)=>order[a.sev]-order[b.sev]);
  if(!fixes.length) fixes.push({sev:'lo',t:'No major problems found',b:'Tailor the skills and summary to each job post before you apply.'});

  // rewrites
  const cand=[];
  info.forEach(b=>{
    if(b.words<5) return;
    let after=null,why=[];
    for(const [re,rep] of LEADS){ if(re.test(b.text)){after=b.text.replace(re,rep);why.push('weak opener');break;} }
    if(!after&&!b.strong){after='[Action verb] '+b.text.charAt(0).toLowerCase()+b.text.slice(1);why.push('no strong verb');}
    if(!b.metric){after=(after||b.text).replace(/[.\s]+$/,'')+', improving [metric] by [X%]';why.push('no result stated');}
    if(after) cand.push({before:b.text,after,why:why.join(' · '),pri:(b.weakLead?0:b.strong?2:1)});
  });
  cand.sort((a,b)=>a.pri-b.pri);

  return {role,lines,secOf,headAt,marks,found,rating,total:Math.round(total),rows,best,worst,
    coreFound,coreMiss,useFound,useMiss,jdInfo,fixes,rewrites:cand.slice(0,4),
    stats:{words,nB,sections:present.size},unproven};
}
/*ENGINE-END*/

/* ================= SAMPLE ================= */
const SAMPLE=`AARAV MEHTA
Bengaluru, India | aarav.sample@example.com | +91 90000 00000 | linkedin.com/in/aarav-sample | github.com/aarav-sample

SUMMARY
Hardworking and passionate computer science student looking for an AI/ML internship. Fast learner with team player attitude.

SKILLS
Python, SQL, Pandas, NumPy, scikit-learn, TensorFlow, Matplotlib, Git, Excel

PROJECTS
Customer Churn Prediction
- Built a churn classifier using Python, scikit-learn and feature engineering, reaching 91% accuracy on 7,043 customers
- Compared Logistic Regression and Random Forest using precision, recall and F1 score
Movie Recommendation Engine
- Worked on a recommender that suggests movies from user ratings
- Responsible for data cleaning on a dataset of 100,000 rows
Handwritten Digit Classifier
- Helped with training a small neural network in TensorFlow

EXPERIENCE
Data Science Intern, Sample Labs (Jun 2026 - Aug 2026)
- Assisted in building text classification models for support tickets
- Cleaned datasets and created visualizations using Matplotlib
- Reduced manual labeling time by 30% by writing a pre-labeling script

EDUCATION
B.Tech in Computer Science, Sample Institute of Technology, 2022 - 2026
CGPA: 8.4/10

CERTIFICATIONS
Machine Learning Specialization (online course)`;

/* ================= UI ================= */
const $=s=>document.querySelector(s);
const ta=$('#resume'), markedBody=$('#markedBody'), marked=$('#marked'), jdTa=$('#jd'), roleSel=$('#role');
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let tab='marked', shown=0, sampleOn=true, timer=null;

// signal bars
const signal=$('#signal');
for(let i=0;i<10;i++){signal.insertAdjacentHTML('beforeend',`<div class="b" style="height:${28+i*8}%"><i></i></div>`);}

function setTab(t){
  tab=t;
  $('#tab-marked').setAttribute('aria-selected',t==='marked');
  $('#tab-edit').setAttribute('aria-selected',t==='edit');
  marked.hidden=t!=='marked'; ta.hidden=t!=='edit';
  if(t==='edit') ta.focus({preventScroll:true});
}
function status(msg,err){const s=$('#status');s.textContent=msg||'';s.classList.toggle('err',!!err);}

function renderMarked(res,scan){
  let i=0;
  const html=res.lines.map((ln,idx)=>{
    if(res.headAt[idx]!==undefined) return `<span class="hd">${esc(ln.trim())}</span><span class="note">${esc(SECNAME[res.headAt[idx]])}</span>`;
    let out='',pos=0;
    for(const m of res.marks[idx]){
      out+=esc(ln.slice(pos,m.s));
      const tip=m.t==='s'?`Skill: ${SK[m.id][0]}`:m.t==='n'?'Measurable result':(m.kind==='cliche'?'Cliché: replace with proof':'Weak phrase: lead with an action verb');
      out+=`<span class="mk ${m.t}" style="--i:${i++}" title="${esc(tip)}">${esc(ln.slice(m.s,m.e))}</span>`;
      pos=m.e;
    }
    return out+esc(ln.slice(pos));
  }).join('\n');
  markedBody.innerHTML=html;
  if(scan&&!reduce){
    marked.scrollTop=0; marked.classList.remove('scanning'); void marked.offsetWidth; marked.classList.add('scanning');
    setTimeout(()=>marked.classList.remove('scanning'),2600);
  }
}

function animateNum(to){
  const el=$('#num'); const from=shown; shown=to;
  if(reduce||from===to){el.textContent=to.toFixed(1);return;}
  const t0=performance.now(),d=700;
  (function f(t){const p=clamp((t-t0)/d,0,1),e=1-Math.pow(1-p,3);el.textContent=(from+(to-from)*e).toFixed(1);if(p<1)requestAnimationFrame(f);})(t0);
}

function bandOf(r){return r>=8.5?'Interview ready':r>=7?'Strong':r>=5.5?'Promising':r>=4?'Needs work':'Rebuild';}

function renderReport(res){
  $('#empty').hidden=true; $('#result').style.display='grid';
  animateNum(res.rating);
  [...signal.children].forEach((b,i)=>{b.firstElementChild.style.height=(clamp(res.rating-i,0,1)*100)+'%';});
  $('#verdict').innerHTML=`<b>${bandOf(res.rating)}.</b> ${esc(res.best.name)} is your strongest area. ${esc(res.worst.name)} has the most room, worth up to +${res.worst.gain.toFixed(1)} on the rating.`;
  $('#facts').innerHTML=`<span>ATS-style score ${res.total}/100</span><span>${esc(res.role.label)}</span><span>${res.stats.words} words</span><span>${res.stats.nB} bullets</span><span>${res.stats.sections} sections</span>`;
  $('#breakdown').innerHTML=res.rows.map(r=>`<div class="row"><span class="nm">${esc(r.name)}</span><div class="track"><i class="${r.score<40?'bad':r.score<65?'lo':''}" style="width:${r.score}%"></i></div><span class="val">${r.score}</span><div class="why"><span>${esc(r.note)}</span><span class="gain">${r.w}% weight${r.gain>=0.1?` · up to +${r.gain.toFixed(1)}`:''}</span></div></div>`).join('');
  $('#skillsSub').textContent=`for ${res.role.label}`;
  const have=[...res.coreFound,...res.useFound];
  const gaps=[...res.coreMiss.map(id=>({id,core:true})),...res.useMiss.slice(0,6).map(id=>({id,core:false}))];
  $('#skills').innerHTML=`<div class="sub" style="margin-top:0">Found in your résumé (${have.length})</div><div class="chips">${have.length?have.map(id=>`<span class="chip have">${esc(SK[id][0])}</span>`).join(''):'<span style="color:var(--ink-2)">No role skills detected yet.</span>'}</div>`+
    (gaps.length?`<div class="sub">Skill gaps</div><div class="gaps">${gaps.map(g=>`<div class="gap"><b>${esc(SK[g.id][0])}<span class="badge ${g.core?'core':'use'}">${g.core?'CORE':'BONUS'}</span></b><span class="h">${esc(hint(g.id))}</span></div>`).join('')}</div>`:'<p style="color:var(--ink-2)">No gaps against this role profile.</p>');
  const j=res.jdInfo; $('#jdSec').hidden=!j;
  if(j){
    $('#jdSub').textContent=`${j.match}% match · cosine ${j.cosine}%`;
    $('#jdOut').innerHTML=(j.jdSk.length?`<div class="sub" style="margin-top:0">Skills the post asks for</div><div class="chips">${j.jdSk.map(id=>`<span class="chip ${res.found[id]?'have':'miss'}">${esc(SK[id][0])}</span>`).join('')}</div>`:'')+
      (j.missTerms.length?`<div class="sub">Frequent terms missing from your résumé</div><div class="chips">${j.missTerms.map(t=>`<span class="chip miss">${esc(t)}</span>`).join('')}</div>`:'')+
      `<p style="font-size:.82rem;color:var(--ink-2);margin:12px 0 0">Add a term only where it is true. Match it to your own wording in a bullet instead of pasting a keyword list.</p>`;
  }
  $('#fixes').innerHTML=res.fixes.slice(0,9).map(f=>`<li class="fix"><span class="sev ${f.sev}">${f.sev==='hi'?'High':f.sev==='md'?'Medium':'Low'}</span><div><h3>${esc(f.t)}</h3><p>${esc(f.b)}</p></div></li>`).join('');
  $('#rwSec').hidden=!res.rewrites.length;
  const ph=s=>esc(s).replace(/\[([^\]]+)\]/g,'<span class="ph">[$1]</span>');
  $('#rewrites').innerHTML=res.rewrites.map(r=>`<div class="rw"><div class="r before"><span class="k">Before</span><span>${esc(r.before)}</span></div><div class="r after"><span class="k">After</span><span>${ph(r.after)}</span></div><div class="why">${esc(r.why)}</div></div>`).join('');
}

function run(scan){
  const text=ta.value;
  if(text.trim().length<40){
    $('#empty').hidden=false; $('#result').style.display='none'; markedBody.innerHTML='<span style="color:var(--ink-2)">Paste text in the Edit tab to see it marked up here.</span>'; status('');
    return;
  }
  let res;
  try{res=analyze(text,roleSel.value,jdTa.value);}catch(e){status('Something in that text could not be analyzed. Try pasting plain text.',true);return;}
  renderMarked(res,scan); renderReport(res);
  status(`Analyzed ${res.stats.words} words · ${res.rating.toFixed(1)}/10`);
}
function later(){clearTimeout(timer);timer=setTimeout(()=>run(false),450);}

ta.addEventListener('input',()=>{sampleOn=false;$('#samplePill').hidden=true;later();});
jdTa.addEventListener('input',later);
roleSel.addEventListener('change',()=>run(false));
$('#go').addEventListener('click',()=>{setTab('marked');run(true);});
$('#tab-marked').addEventListener('click',()=>{setTab('marked');run(false);});
$('#tab-edit').addEventListener('click',()=>setTab('edit'));
$('#upload').addEventListener('click',()=>$('#file').click());

async function pdfToText(buf){
  if(!window.pdfjsLib) throw new Error('no pdf reader');
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await pdfjsLib.getDocument({data:buf}).promise; const out=[];
  for(let p=1;p<=pdf.numPages;p++){
    const tc=await (await pdf.getPage(p)).getTextContent(); let y=null,line='';
    for(const it of tc.items){const yy=it.transform[5]; if(y!==null&&Math.abs(yy-y)>3){out.push(line.trim());line='';} line+=it.str+(it.hasEOL?'':' '); y=yy;}
    out.push(line.trim());
  }
  return out.join('\n');
}
async function loadFile(f){
  if(!f) return;
  status(`Reading ${f.name}…`);
  try{
    let t;
    if(/\.pdf$/i.test(f.name)||f.type==='application/pdf') t=await pdfToText(await f.arrayBuffer());
    else t=await f.text();
    if(t.trim().length<40) throw new Error('empty');
    ta.value=t; sampleOn=false; $('#samplePill').hidden=true; setTab('marked'); run(true);
  }catch(e){
    status('Could not read text from that file. Scanned PDFs have no text layer. Paste the text in the Edit tab instead.',true);
  }
}
$('#file').addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value='';});
const pane=document.querySelector('.docpane');
pane.addEventListener('dragover',e=>{e.preventDefault();});
pane.addEventListener('drop',e=>{e.preventDefault();loadFile(e.dataTransfer.files[0]);});

ta.value=SAMPLE; setTab('marked'); run(true);
