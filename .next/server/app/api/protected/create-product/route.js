(()=>{var t={};t.id=5893,t.ids=[5893],t.modules={3295:t=>{"use strict";t.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4253:(t,e,r)=>{"use strict";r.a(t,async(t,u)=>{try{r.r(e),r.d(e,{GET:()=>n,POST:()=>c,PUT:()=>d});var s=r(32190),o=r(51944),a=t([o]);async function c(t){try{let e=t.headers.get("x-user-uuid");if(!e)return s.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let{searchParams:r}=new URL(t.url),u=r.get("company_uuid"),a=await t.json();a.company_uuid=u,a.customer_uuid=e;let c=await (0,o.LD)(a);return s.NextResponse.json({status:c.status,msg:c.msg,data:c.data},{status:c.status?200:400})}catch(t){return console.error("Error Adding company:",t),s.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}async function n(t){try{if(!t.headers.get("x-user-uuid"))return s.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let{searchParams:e}=new URL(t.url),r=e.get("company_uuid"),u=await (0,o.ok)(String(r));return s.NextResponse.json({status:u.status,msg:u.msg,data:u.data},{status:u.status?200:400})}catch(t){return console.error("Error Getting Product:",t),s.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}async function d(t){try{let e=t.headers.get("x-user-uuid");if(!e)return s.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let{searchParams:r}=new URL(t.url),u=r.get("product_uuid"),a=await t.json();a.product_uuid=u,a.customer_uuid=e;let c=await (0,o.JQ)(a);return s.NextResponse.json({status:c.status,msg:c.msg,data:c.data},{status:c.status?200:400})}catch(t){return console.error("Error Updating Product:",t),s.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}o=(a.then?(await a)():a)[0],u()}catch(t){u(t)}})},4819:(t,e,r)=>{"use strict";r.a(t,async(t,u)=>{try{r.r(e),r.d(e,{patchFetch:()=>d,routeModule:()=>p,serverHooks:()=>_,workAsyncStorage:()=>i,workUnitAsyncStorage:()=>l});var s=r(96559),o=r(48088),a=r(37719),c=r(4253),n=t([c]);c=(n.then?(await n)():n)[0];let p=new s.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/protected/create-product/route",pathname:"/api/protected/create-product",filename:"route",bundlePath:"app/api/protected/create-product/route"},resolvedPagePath:"D:\\ct-quotation\\src\\app\\api\\protected\\create-product\\route.ts",nextConfigOutput:"",userland:c}),{workAsyncStorage:i,workUnitAsyncStorage:l,serverHooks:_}=p;function d(){return(0,a.patchFetch)({workAsyncStorage:i,workUnitAsyncStorage:l})}u()}catch(t){u(t)}})},10846:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},51944:(t,e,r)=>{"use strict";r.a(t,async(t,u)=>{try{r.d(e,{JQ:()=>n,LD:()=>a,ok:()=>c});var s=r(96364),o=t([s]);s=(o.then?(await o)():o)[0];let a=async t=>{let e=`
    INSERT INTO quotation_products (
      product_name,
      product_category,
      product_size,
      product_quantity,
      product_cost,
      customer_uuid,
      company_uuid,
      product_series,
      product_finish,
      product_pieces_per_box,
      product_weight,
      product_sq_ft_box
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    RETURNING product_uuid
  `,r=[t.product_name??null,t.product_category??null,t.product_size??null,t.product_quantity??null,t.product_cost??null,t.customer_uuid,t.company_uuid??null,t.product_series??null,t.product_finish??null,t.product_pieces_per_box??null,t.product_weight??null,t.product_sq_ft_box??null],u=await s.d.query(e,r);return 0===u.rowCount?{msg:"Quotation product not created",code:400,status:!1}:{msg:"Quotation product created successfully",code:200,status:!0,data:u.rows[0]}},c=async t=>{let e=`
    select * from quotation_products where company_uuid=$1;
  `,r=await s.d.query(e,[t]);return 0===r.rowCount?{msg:"Quotation product not founded",code:400,status:!1}:{msg:"Quotation product founded successfully",code:200,status:!0,data:r.rows}},n=async t=>{if(!t.product_uuid)return{msg:"Missing product_uuid for update",code:400,status:!1};let e=`
    UPDATE quotation_products SET
      product_name = $1,
      product_category = $2,
      product_size = $3,
      product_quantity = $4,
      product_cost = $5,
      customer_uuid = $6,
      product_series = $7,
      product_finish = $8,
      product_pieces_per_box = $9,
      product_weight = $10,
      product_sq_ft_box = $11,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_uuid = $12
    RETURNING product_uuid
  `,r=[t.product_name??null,t.product_category??null,t.product_size??null,t.product_quantity??null,t.product_cost??null,t.customer_uuid,t.product_series??null,t.product_finish??null,t.product_pieces_per_box??null,t.product_weight??null,t.product_sq_ft_box??null,t.product_uuid],u=await s.d.query(e,r);return 0===u.rowCount?{msg:"Quotation product not found or not updated",code:404,status:!1}:{msg:"Quotation product updated successfully",code:200,status:!0,data:u.rows[0]}};u()}catch(t){u(t)}})},63033:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:t=>{"use strict";t.exports=import("pg")},78335:()=>{},96364:(t,e,r)=>{"use strict";r.a(t,async(t,u)=>{try{r.d(e,{d:()=>a});var s=r(64939),o=t([s]);let a=new(s=(o.then?(await o)():o)[0]).Pool({user:process.env.DB_USER,host:process.env.DB_HOST,database:process.env.DB_NAME,password:process.env.DB_PASSWORD,port:5432,ssl:{rejectUnauthorized:!1}});u()}catch(t){u(t)}})},96487:()=>{}};var e=require("../../../../webpack-runtime.js");e.C(t);var r=t=>e(e.s=t),u=e.X(0,[4447,580],()=>r(4819));module.exports=u})();