import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";
const $=id=>document.getElementById(id);
const categories=["Alimentação","Saúde","Educação e cantina escolar","Transporte e carro","Cartões e adiantamentos","Igreja e doações","Contas da casa","Presentes e cuidados pessoais","Casa e manutenção","Supermercado","Lazer","Compras diversas","Transferências pessoais","Telefonia e internet","Compras pessoais","Assinaturas e serviços","Outros"];
const rules=[[/farm[aá]cia|rem[eé]dio|m[eé]dico|consulta|exame|dentista/i,"Saúde"],[/mercado|supermercado|atacad/i,"Supermercado"],[/escola|cantina|mensalidade escolar|material escolar/i,"Educação e cantina escolar"],[/gasolina|combust[ií]vel|uber|estacionamento|oficina/i,"Transporte e carro"],[/d[ií]zimo|oferta|igreja/i,"Igreja e doações"],[/energia|luz|[aá]gua|condom[ií]nio|aluguel casa/i,"Contas da casa"],[/internet|telefone|celular|recarga/i,"Telefonia e internet"],[/netflix|spotify|assinatura/i,"Assinaturas e serviços"],[/restaurante|lanche|pizza|almo[cç]o|jantar|ifood/i,"Alimentação"]];
const money=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
const today=()=>new Date().toLocaleDateString("en-CA");
const nowMonth=()=>today().slice(0,7);
let db,user,items=[],filter=null;
function message(t){$("message").textContent=t||""}
function guess(s){return rules.find(([re])=>re.test(s))?.[1]||"Outros"}
function parseMoney(s){const v=s.trim().replace(/R\$\s*/g,"").replace(/\./g,"").replace(",",".");return /^\d+(\.\d{1,2})?$/.test(v)?Number(v):NaN}
function reset(){ $("expense-form").reset();$("expense-id").value="";$("form-title").textContent="Nova despesa";$("cancel").hidden=true;$("date").value=today();$("category").value="Outros" }
function render(){
const grouped=new Map();let total=0;
for(const e of items){const a=Number(e.amount);total+=a;const v=grouped.get(e.category)||{total:0,count:0};v.total+=a;v.count++;grouped.set(e.category,v)}
$("total").textContent=money(total);
const cats=$("categories");cats.replaceChildren();
for(const [name,v] of [...grouped.entries()].sort((a,b)=>b[1].total-a[1].total)){const b=document.createElement("button");b.className="item category";const l=document.createElement("span");l.textContent=name;const s=document.createElement("small");s.textContent=v.count+" lançamento(s)";l.append(s);const r=document.createElement("strong");r.textContent=money(v.total);b.append(l,r);b.onclick=()=>{filter=name;render()};cats.append(b)}
if(!grouped.size){const e=document.createElement("p");e.className="empty";e.textContent="Nenhuma despesa neste mês.";cats.append(e)}
$("clear-filter").hidden=!filter;$("list-title").textContent=filter||"Lançamentos do mês";
const list=$("expenses");list.replaceChildren();const visible=items.filter(e=>!filter||e.category===filter);
for(const e of visible){const row=document.createElement("div");row.className="item";const left=document.createElement("div");const title=document.createElement("b");title.textContent=e.description;const sub=document.createElement("small");sub.textContent=e.expense_date.split("-").reverse().join("/")+" · "+e.category;left.append(title,sub);const val=document.createElement("strong");val.textContent=money(Number(e.amount));const actions=document.createElement("div");actions.className="actions";const edit=document.createElement("button");edit.textContent="Editar";edit.className="secondary";edit.onclick=()=>{$("expense-id").value=e.id;$("description").value=e.description;$("amount").value=Number(e.amount).toFixed(2).replace(".",",");$("date").value=e.expense_date;$("category").value=e.category;$("form-title").textContent="Editar despesa";$("cancel").hidden=false;window.scrollTo({top:0,behavior:"smooth"})};const del=document.createElement("button");del.textContent="Excluir";del.className="secondary";del.onclick=async()=>{if(!confirm("Excluir esta despesa?"))return;const {error}=await db.from("expenses").delete().eq("id",e.id).eq("user_id",user.id);if(error)message(error.message);else await load()};actions.append(edit,del);row.append(left,val,actions);list.append(row)}
if(!visible.length){const e=document.createElement("p");e.className="empty";e.textContent="Nenhum lançamento.";list.append(e)}
}
async function load(){if(!user)return;const month=$("month").value;const start=month+"-01";const [y,m]=month.split("-").map(Number);const end=new Date(Date.UTC(y,m,1)).toISOString().slice(0,10);const {data,error}=await db.from("expenses").select("id,description,amount,category,expense_date").eq("user_id",user.id).gte("expense_date",start).lt("expense_date",end).order("expense_date",{ascending:false});if(error){message(error.message);return}items=data||[];render()}
function show(session){user=session?.user||null;$("login").hidden=!!user;$("app").hidden=!user;$("logout").hidden=!user;if(user)load()}
async function main(){
$("month").value=nowMonth();$("date").value=today();for(const c of categories){const o=document.createElement("option");o.value=o.textContent=c;$("category").append(o)}$("category").value="Outros";
const c=window.MEUS_GASTOS_CONFIG;if(!c?.supabaseUrl||!c?.supabasePublishableKey||c.supabaseUrl.includes("SEU-PROJETO")){$("setup").hidden=false;return}
db=createClient(c.supabaseUrl,c.supabasePublishableKey);const {data:{session}}=await db.auth.getSession();show(session);db.auth.onAuthStateChange((_event,s)=>show(s));
$("login-form").onsubmit=async ev=>{ev.preventDefault();message("");const {error}=await db.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error)message("Não foi possível entrar: "+error.message)};
$("logout").onclick=()=>db.auth.signOut();
$("month").onchange=()=>{filter=null;load()};$("clear-filter").onclick=()=>{filter=null;render()};$("cancel").onclick=reset;
$("description").oninput=()=>{if($("expense-id").value)return;const raw=$("description").value;const m=raw.match(/^(.*?)\s+(?:R\$\s*)?(\d[\d.]*,\d{1,2})$/);if(m&&!$("amount").value){$("amount").value=m[2];$("description").value=m[1]}$("category").value=guess($("description").value)};
$("expense-form").onsubmit=async ev=>{ev.preventDefault();message("");const amount=parseMoney($("amount").value);if(!Number.isFinite(amount)||amount<=0){message("Informe um valor válido maior que zero.");return}const payload={description:$("description").value.trim(),amount,expense_date:$("date").value,category:$("category").value,user_id:user.id};if(!payload.description||!payload.expense_date){message("Preencha a descrição e a data.");return}const id=$("expense-id").value;const q=id?db.from("expenses").update(payload).eq("id",id).eq("user_id",user.id):db.from("expenses").insert(payload);const {error}=await q;if(error){message(error.message);return}reset();await load()};
db.channel("expenses-changes").on("postgres_changes",{event:"*",schema:"public",table:"expenses"},()=>load()).subscribe();
}
main().catch(e=>message("Erro ao iniciar: "+e.message));
