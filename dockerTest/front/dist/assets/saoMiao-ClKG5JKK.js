import{P as e,S as t,U as n,V as r,Y as i,b as a,h as o,j as s,s as c,t as l,v as u,x as d,z as f}from"./index-BHMNLeOJ.js";import{f as p}from"./styleChecker-BVID3Rmc.js";import{n as m,t as h}from"./spin-BDyZotTm.js";import{t as g}from"./space-DRPy-sEF.js";var _=class e{static{this.APP_ID=`cli_a759248f7af4501c`}static{this.APP_SECRET=`OSyllAcQ84Lz4uIlj7weJhV627nPemJj`}constructor(e,t){this.table_id=e,this.app_token=t,this.auth_token=``}returnAuthToken(){return this.auth_token}async getAuthToken(){let t=await(await fetch(`/feishuApi/open-apis/auth/v3/tenant_access_token/internal`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({app_id:e.APP_ID,app_secret:e.APP_SECRET})})).json();return t.code===0?this.auth_token=t.tenant_access_token:console.log(`获取授权token失败`,t.msg),!!t.tenant_access_token}async search(e,t){return await this.getAuthToken(),await(await fetch(`/feishuApi/open-apis/bitable/v1/apps/${this.app_token}/tables/${this.table_id}/records/search?page_size=${e.pageSize}${e.page_token?`&page_token=${e.page_token}`:``}`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${this.auth_token}`},body:JSON.stringify({...t||{}})})).json()}async getAllData(e){let t=await this.search({pageSize:500},e);if(console.log(`response`,t),t.code!==0)return[];let n=[],{items:r,total:i}=t.data;n.push(...r);let{page_token:a}=t.data,o=Math.ceil(i/500);for(let t=1;t<o;t++){let t=await this.search({pageSize:500,page_token:a},e);if(t.code===0){let{items:e,page_token:r}=t.data;a=r,n.push(...e)}}return console.log(`result`,n.length),console.log(`result[0]`,n[0]),n}async queryTable(){await this.getAuthToken();let e=await(await fetch(`/feishuApi/open-apis/sheets/v2/spreadsheets/${this.app_token}/values_batch_get?ranges=${this.table_id}`,{headers:{Authorization:`Bearer ${this.auth_token}`}})).json();if(e.code!==0)return{success:!1,msg:e.msg};let t=e.data.valueRanges?.[0].values||[],n=t[0],r=t.slice(1);return r.length===0?{success:!1,msg:`未找到数据`}:{success:!0,data:r.map(e=>n.reduce((t,n,r)=>(t[n]=e[r]||``,t),{}))}}},v={class:`index_container`},y={class:`index_wrap`},b={class:`index_input`},x={class:`index_output`},S={style:{display:`flex`,"justify-content":`center`}},C={class:`result_wrap`},w=[`src`],T={key:1},E=l(t({__name:`index`,setup(t){let l=new _(`730cdd`,`GB2Fw6JwUimYCAkeDkwcrHsdnhd`),E=n(``),D=n(!1),O=n([]),k=n(null);s(()=>{j()});let A=(e,t)=>{let n=null;return()=>{n&&clearTimeout(n),n=setTimeout(()=>{e()},t)}},j=async()=>{let e=await l.queryTable();e.success&&(O.value=e.data)},M=A(async()=>{try{if(D.value=!0,k.value=null,!E.value)return;let e=E.value.replace(/[\r\n]/g,``).trim();console.log(`sheetData.value`,O.value),console.log(`searchStr`,e);let t=O.value.find(t=>String(t[`69码`])===e);console.log(`findItem`,t),t&&(k.value={name:t.名称,color:t.颜色,size:t.尺码,code:t.款号,code69:t[`69码`],image:t.图片?.link})}catch(e){console.log(`error`,e)}finally{D.value=!1}},300),N=()=>{E.value=``},P=e=>{let t=e.target.value;console.log(`value`,t);let n=t.split(`
`).map(e=>e.trim()).filter(Boolean).pop();console.log(`lastCode`,n),E.value=n},F=()=>{if(!k.value)return;let e=k.value.image,t=window.open(``,`_blank`);t&&(t.document.write(`
			<html>
				<head>
					<title>打印</title>
					<style>
						body {
							margin: 0;
							padding: 20px;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						img {
							max-width: 100%;
							height: auto;
						}
						@media print {
							body {
								margin: 0;
								padding: 0;
							}
							img {
								height: 100%;
							}
							@page {
								margin: 0;
							}
						}
					</style>
				</head>
				<body>
					<img src="${e}" alt="商品图片" />
				</body>
			</html>
		`),t.document.close(),t.onload=()=>{t.print()})},I=e=>{console.log(`keydown`,e.target.value),M()};return(t,n)=>{let s=m,l=p,_=g,O=h;return e(),u(`div`,v,[o(`div`,y,[o(`div`,b,[d(s,{value:i(E),"onUpdate:value":n[0]||=e=>r(E)?E.value=e:null,"auto-size":{minRows:8,maxRows:8},placeholder:`请输入要查询的内容或扫描商品码`,onChange:P,onKeydown:c(I,[`enter`])},null,8,[`value`]),d(_,{size:10,style:{"margin-top":`10px`}},{default:f(()=>[d(l,{type:`primary`,onClick:i(M)},{default:f(()=>[...n[1]||=[a(`查询`,-1)]]),_:1},8,[`onClick`]),d(l,{type:`primary`,danger:``,onClick:N},{default:f(()=>[...n[2]||=[a(`清除`,-1)]]),_:1})]),_:1})]),o(`div`,x,[o(`div`,S,[d(l,{size:`large`,type:`primary`,disabled:!i(k),onClick:F},{default:f(()=>[...n[3]||=[a(` 打印 `,-1)]]),_:1},8,[`disabled`])]),o(`div`,C,[d(O,{spinning:i(D),tip:`查询中...`},{default:f(()=>[i(k)?(e(),u(`img`,{key:0,src:i(k).image,alt:`商品图片`,referrerpolicy:`no-referrer`},null,8,w)):(e(),u(`div`,T,[...n[4]||=[o(`span`,null,`暂无结果`,-1)]]))]),_:1},8,[`spinning`])])])])])}}}),[[`__scopeId`,`data-v-0298582a`]]);export{E as default};