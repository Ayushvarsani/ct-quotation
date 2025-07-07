(()=>{var t={};t.id=4437,t.ids=[4437],t.modules={3295:t=>{"use strict";t.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},26157:(t,e,o)=>{"use strict";o.a(t,async(t,a)=>{try{o.r(e),o.d(e,{GET:()=>m,POST:()=>d,PUT:()=>_});var r=o(32190),s=o(26232),u=o(94447),n=o(62484),c=t([s,u]);async function d(t){try{let e=t.headers.get("x-user-uuid");if(!e)return r.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let o=await t.json(),a=Array.isArray(o.module)?o.module:[];o.created_by=e,a.forEach(t=>{"string"==typeof t&&(o[t]=!0)}),o.start_date&&(o.start_date=new Date(o.start_date)),o.end_date&&(o.end_date=new Date(o.end_date));let c=await (0,s.Nv)(o);return o.customer_email=o.company_email,o.customer_name=o.company_name,o.customer_email=o.company_email,o.customer_country_code=o.company_country_code,o.customer_mobile=o.company_mobile,o.customer_password=await (0,n.E)(o.company_password),o.customer_role=1,o.company_uuid=c.data.company_uuid,o.created_by_admin=e,a.includes("quotation_module")&&await (0,s.vx)(o),await (0,u.SI)(o),r.NextResponse.json({status:c.status,msg:c.msg,data:c.data},{status:c.status?200:400})}catch(t){if(console.error("Registration error:",t),t instanceof Error&&t.code){if("23505"===t.code)return r.NextResponse.json({status:!1,msg:"Email or mobile already linked with another company"},{status:400});return r.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}}async function _(t){try{let e=t.headers.get("x-user-uuid");if(!e)return r.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let o=await t.json();(Array.isArray(o.module)?o.module:[]).forEach(t=>{"string"==typeof t&&(o[t]=!0)});let{searchParams:a}=new URL(t.url);o.company_uuid=a.get("company_uuid"),o.created_by=e,o.start_date&&(o.start_date=new Date(o.start_date)),o.end_date&&(o.end_date=new Date(o.end_date));let c=await (0,s.JT)(o);return o.customer_email=o.company_email,o.customer_name=o.company_name,o.customer_email=o.company_email,o.customer_country_code=o.company_country_code,o.customer_mobile=o.company_mobile,o.customer_role=1,o.company_password&&(o.customer_password=await (0,n.E)(o.company_password)),o.company_uuid=c.data.company_uuid,o.created_by_admin=e,o.quotation_module&&await (0,s.AB)(o),await (0,u.Gk)(o),r.NextResponse.json({status:c.status,msg:c.msg,data:c.data},{status:c.status?200:400})}catch(t){if(console.error("Registration error:",t),t instanceof Error&&t.code){if("23505"===t.code)return r.NextResponse.json({status:!1,msg:"Email or mobile already linked with another company"},{status:400});return r.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}}async function m(t){try{if(!t.headers.get("x-user-uuid"))return r.NextResponse.json({status:!1,msg:"Unauthorized access"},{status:401});let{searchParams:e}=new URL(t.url),o=e.get("company_uuid"),a=[],u=await (0,s.C1)(String(o));return u.data.quotation_module&&a.push("quotation_module"),u.data.bussiness_card_module&&a.push("bussiness_card_module"),u.data.module=a,r.NextResponse.json({status:u.status,msg:u.msg,data:u.data},{status:u.status?200:400})}catch(t){return r.NextResponse.json({status:!1,msg:"Internal Server Error",error:t},{status:500})}}[s,u]=c.then?(await c)():c,a()}catch(t){a(t)}})},26232:(t,e,o)=>{"use strict";o.a(t,async(t,a)=>{try{o.d(e,{AB:()=>d,C1:()=>_,JT:()=>c,Nv:()=>u,vx:()=>n});var r=o(96364),s=t([r]);r=(s.then?(await s)():s)[0];let u=async t=>{let e=`
    INSERT INTO company_info (
      company_name,
      company_email,
      company_mobile,
      company_country_code,
      comapny_location,
      company_city,
      company_state,
      company_country,
      company_gst,
      created_by,
      quotation_module,
      bussiness_card_module,
      start_date,
      end_date,
      company_message_number
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13,$14,$15
    )
    RETURNING company_uuid
  `,o=[t.company_name,t.company_email,t.company_mobile,t.company_country_code,t.comapny_location??null,t.company_city??null,t.company_state??null,t.company_country??null,t.company_gst??null,t.created_by??null,t.quotation_module??!1,t.bussiness_card_module??!1,t.start_date,t.end_date,t.company_message_number],a=await r.d.query(e,o);return 0===a.rowCount?{msg:"Company not created",code:200,status:!1}:{msg:"Company registered",code:200,status:!0,data:a.rows[0]}},n=async t=>{let e=`
    INSERT INTO quotation_labels (
      company_uuid,
      product_name,
      product_category,
      product_size,
      product_quantity,
      product_cost,
      product_series,
      product_finish,
      product_pieces_per_box,
      product_weight,
      product_sq_ft_box,
      pre_grade,
      com_grade,
      eco_grade,
      std_grade
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13,$14,$15
    )
    RETURNING id
  `,o=[t.company_uuid,t.product_name??null,t.product_category??null,t.product_size??null,t.product_quantity??null,t.product_cost??null,t.product_series??null,t.product_finish??null,t.product_pieces_per_box??null,t.product_weight??null,t.product_sq_ft_box??null,t.pre_grade??!1,t.com_grade??!1,t.eco_grade??!1,t.std_grade??!1];try{let t=await r.d.query(e,o);if(0===t.rowCount)return{msg:"Quotation label not created",code:200,status:!1};return{msg:"Quotation label created",code:200,status:!0,data:{id:t.rows[0].id}}}catch(t){return console.error("Error creating quotation label:",t),{msg:"Database error occurred",code:500,status:!1,error:t}}},c=async t=>{let e=`
    UPDATE company_info SET
      company_name = $1,
      company_email = $2,
      company_mobile = $3,
      company_country_code = $4,
      comapny_location = $5,
      company_city = $6,
      company_state = $7,
      company_country = $8,
      company_gst = $9,
      created_by = $10,
      quotation_module = $11,
      bussiness_card_module = $12,
      status=$13,
      start_date=$14,
      end_date=$15,
      company_message_number=$16
    WHERE company_uuid = $17
    RETURNING company_uuid
  `,o=[t.company_name??null,t.company_email??null,t.company_mobile??null,t.company_country_code??null,t.comapny_location??null,t.company_city??null,t.company_state??null,t.company_country??null,t.company_gst??null,t.created_by??null,t.quotation_module??!1,t.bussiness_card_module??!1,t.status??"ACTIVE",t.start_date,t.end_date,t.company_message_number,t.company_uuid];try{let t=await r.d.query(e,o);if(0===t.rowCount)return{msg:"Company not found or update failed",code:404,status:!1};return{msg:"Company updated successfully",code:200,status:!0,data:t.rows[0]}}catch(t){return console.error("Error updating company:",t),{msg:"Database error occurred",code:500,status:!1,error:t}}},d=async t=>{let e=`
    UPDATE quotation_labels SET
      product_name = $1,
      product_category = $2,
      product_size = $3,
      product_quantity = $4,
      product_cost = $5,
      product_series = $6,
      product_finish = $7,
      product_pieces_per_box = $8,
      product_weight = $9,
      product_sq_ft_box = $10,
      pre_grade = $11,
      com_grade = $12,
      eco_grade = $13,
      std_grade = $14,
      updated_at = CURRENT_TIMESTAMP
    WHERE company_uuid = $15
    RETURNING id
  `,o=[t.product_name??null,t.product_category??null,t.product_size??null,t.product_quantity??null,t.product_cost??null,t.product_series??null,t.product_finish??null,t.product_pieces_per_box??null,t.product_weight??null,t.product_sq_ft_box??null,t.pre_grade??!1,t.com_grade??!1,t.eco_grade??!1,t.std_grade??!1,t.company_uuid];try{let t=await r.d.query(e,o);if(0===t.rowCount)return{msg:"Quotation label not found or update failed",code:404,status:!1};return{msg:"Quotation label updated",code:200,status:!0,data:{id:t.rows[0].id}}}catch(t){return console.error("Error updating quotation label:",t),{msg:"Database error occurred",code:500,status:!1,error:t}}},_=async t=>{let e=`
    select * from company_info ci left join quotation_labels qp on ci.company_uuid=qp.company_uuid
    WHERE ci.company_uuid = $1`;try{let o=await r.d.query(e,[t]);if(0===o.rowCount)return{msg:"Company not found",code:404,status:!1};return{msg:"Company get successfully",code:200,status:!0,data:o.rows[0]}}catch(t){return console.error("Error updating company:",t),{msg:"Database error occurred",code:500,status:!1,error:t}}};a()}catch(t){a(t)}})},29294:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:t=>{"use strict";t.exports=require("crypto")},62484:(t,e,o)=>{"use strict";o.d(e,{E:()=>r,b:()=>s});var a=o(85663);let r=async t=>{let e=await a.Ay.genSalt(10);return a.Ay.hash(t,e)},s=(t,e)=>a.Ay.compare(t,e)},63033:t=>{"use strict";t.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:t=>{"use strict";t.exports=import("pg")},78315:(t,e,o)=>{"use strict";o.a(t,async(t,a)=>{try{o.r(e),o.d(e,{patchFetch:()=>d,routeModule:()=>_,serverHooks:()=>l,workAsyncStorage:()=>m,workUnitAsyncStorage:()=>i});var r=o(96559),s=o(48088),u=o(37719),n=o(26157),c=t([n]);n=(c.then?(await c)():c)[0];let _=new r.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/api/protected/create-company/route",pathname:"/api/protected/create-company",filename:"route",bundlePath:"app/api/protected/create-company/route"},resolvedPagePath:"D:\\ct-quotation\\src\\app\\api\\protected\\create-company\\route.ts",nextConfigOutput:"",userland:n}),{workAsyncStorage:m,workUnitAsyncStorage:i,serverHooks:l}=_;function d(){return(0,u.patchFetch)({workAsyncStorage:m,workUnitAsyncStorage:i})}a()}catch(t){a(t)}})},78335:()=>{},94447:(t,e,o)=>{"use strict";o.a(t,async(t,a)=>{try{o.d(e,{Gk:()=>n,SI:()=>u,xt:()=>c});var r=o(96364),s=t([r]);r=(s.then?(await s)():s)[0];let u=async t=>{let e=`
    INSERT INTO customers (
      customer_name,
      customer_email,
      customer_password,
      customer_country_code,
      customer_mobile,
      customer_role,
      quotation_module,
      bussiness_card_module,
      created_by_admin,
      company_uuid
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,$10
    )
    RETURNING customer_uuid
  `;console.log(t),console.log(t.customer_password);let o=[t.customer_name,t.customer_email,t.customer_password,t.customer_country_code??"+91",t.customer_mobile,t.customer_role??null,t.quotation_module??!1,t.bussiness_card_module??!1,t.created_by_admin??null,t.company_uuid],a=await r.d.query(e,o);return 0===a.rowCount?{msg:"Customer not created",code:400,status:!1}:{msg:"Customer registered successfully",code:200,status:!0,data:a.rows[0]}},n=async t=>{console.log(t.bussiness_card_module);let e=`
    UPDATE customers SET
      customer_name = $1,
      customer_email = $2,
      customer_country_code = $3,
      customer_mobile = $4,
      customer_role = $5,
      quotation_module = $6,
      bussiness_card_module = $7`,o=[t.customer_name??null,t.customer_email??null,t.customer_country_code??"+91",t.customer_mobile??null,t.customer_role??1,t.quotation_module??!1,!1],a=o.length+1;null!=t.customer_password&&void 0!=t.customer_password&&(e+=`,customer_password=$${a}`,o.push(t.customer_password),a+=1),null!=t.status&&void 0!=t.status&&(e+=`,status=$${a}`,o.push(t.status),a+=1),e+=` WHERE customer_uuid = $${a}
    RETURNING customer_uuid`,o.push(t.customer_uuid);let s=await r.d.query(e,o);return 0===s.rowCount?{msg:"Customer not found or update failed",code:404,status:!1}:{msg:"Customer updated successfully",code:200,status:!0,data:{customer_uuid:s.rows[0].customer_uuid}}},c=async t=>{let e=`
    select * from customers
    WHERE customer_uuid = $1
  `;try{let o=await r.d.query(e,[t]);if(0===o.rowCount)return{msg:"Customer not found ",code:404,status:!1};return{msg:"Customer get successfully",code:200,status:!0,data:o.rows}}catch(t){return console.error("Error updating customer:",t),{msg:"Database error occurred",code:500,status:!1,error:t}}};a()}catch(t){a(t)}})},96364:(t,e,o)=>{"use strict";o.a(t,async(t,a)=>{try{o.d(e,{d:()=>u});var r=o(64939),s=t([r]);let u=new(r=(s.then?(await s)():s)[0]).Pool({user:process.env.DB_USER,host:process.env.DB_HOST,database:process.env.DB_NAME,password:process.env.DB_PASSWORD,port:5432,ssl:{rejectUnauthorized:!1}});a()}catch(t){a(t)}})},96487:()=>{}};var e=require("../../../../webpack-runtime.js");e.C(t);var o=t=>e(e.s=t),a=e.X(0,[4447,580,5663],()=>o(78315));module.exports=a})();