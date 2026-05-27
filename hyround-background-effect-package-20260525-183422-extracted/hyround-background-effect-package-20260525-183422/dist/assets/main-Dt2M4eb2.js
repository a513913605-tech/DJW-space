import{v as ce,S as pe,r as de,g as me,P as ve,d as y,G as W,h as fe,D as O,O as E,I as _,f as j,M as b,u as V,b as H,F as ue,i as X,m as Y,j as he,L as we,s as k,a as ge,k as q,o as Z,V as J,T as xe,e as ye,c as Me}from"./three.module-CwnIRiZS.js";const Ce=document.querySelector("#scene"),U=new ce({canvas:Ce,alpha:!0,antialias:!0,powerPreference:"high-performance"});U.outputColorSpace=pe;U.setClearColor(15986922,0);const C=new de;C.fog=new me(15789026,.034);const z=new ve(46,1,.1,90);z.position.set(0,.12,12.5);const S=new J,T=new J,Pe=new Me;let G=1407;const n=()=>(G=G*1664525+1013904223>>>0,G/4294967296),M={ice:new y("#fffdf8"),pearl:new y("#f7efe1"),gold:new y("#d5ad62"),amber:new y("#b88942"),bronze:new y("#8f6a38"),prismBlue:new y("#d8f8ff"),prismPink:new y("#ffe0f4"),prismLilac:new y("#eee4ff")},F=new W;C.add(F);const be=new fe(16777215,15785917,4.2),K=new O(16777215,3.1);K.position.set(-4.5,5.5,6.5);const Q=new O(15779955,1.55);Q.position.set(4,-2,5);C.add(be,K,Q);const D=new E,$=ae({count:3600,spreadX:26,spreadY:14,spreadZ:17,sizeRange:[.55,2.4],alphaRange:[.08,.34],speedRange:[.08,.28]}),ee=ae({count:1700,spreadX:18,spreadY:10,spreadZ:10,sizeRange:[.8,3.6],alphaRange:[.12,.52],speedRange:[.18,.52]}),L=Fe(),oe=Ae(),Se=De();F.add($.mesh,ee.mesh,L.group,oe,Se);C.add(ze());function te(){const e=new xe(1,0);return e.rotateX(Math.PI*.18),e.scale(1,.84,.46),e}function ne(e=.52){return new k({transparent:!0,depthWrite:!1,side:ye,uniforms:{uOpacity:{value:e}},vertexShader:`
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec4 localPosition = vec4(position, 1.0);
        vec3 localNormal = normal;

        #ifdef USE_INSTANCING
          localPosition = instanceMatrix * localPosition;
          localNormal = mat3(instanceMatrix) * localNormal;
        #endif

        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0, 0.96, 0.86);
        #endif

        vec4 worldPosition = modelMatrix * localPosition;
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * localNormal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,fragmentShader:`
      uniform float uOpacity;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normalDirection = normalize(vNormal);
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(normalDirection, viewDirection)), 1.55);
        float band = sin((normalDirection.x * 3.1 + normalDirection.y * 4.7 + vWorldPosition.x * 0.35) * 5.4);

        vec3 rose = vec3(1.0, 0.78, 0.92);
        vec3 blue = vec3(0.70, 0.9, 1.0);
        vec3 gold = vec3(1.0, 0.82, 0.42);
        vec3 prism = mix(rose, blue, smoothstep(-0.55, 0.65, band));
        prism = mix(prism, gold, smoothstep(0.2, 1.0, sin(band + normalDirection.z * 4.0)) * 0.45);

        vec3 glass = mix(vColor, vec3(1.0), 0.5);
        vec3 color = mix(glass, prism, 0.28 + fresnel * 0.62);
        color += vec3(1.0, 0.88, 0.58) * fresnel * 0.22;

        float alpha = uOpacity * (0.26 + fresnel * 0.7);
        gl_FragColor = vec4(color, alpha);
      }
    `})}function ae({count:e,spreadX:o,spreadY:t,spreadZ:r,sizeRange:a,alphaRange:x,speedRange:v}){const d=new Float32Array(e*3),m=new Float32Array(e*3),f=new Float32Array(e),s=new Float32Array(e),u=new Float32Array(e),i=new Float32Array(e),l=new Float32Array(e),h=new Float32Array(e*3),P=te(),c=new _(P,ne(.64),e);c.instanceMatrix.setUsage(j),c.frustumCulled=!1;const p=new y;for(let w=0;w<e;w++){const g=w*3,A=n()<.44,N=(n()-.5)*o,R=A?Math.sin(N*.72+n()*4)*1.9+(n()-.5)*2.1:(n()-.5)*t,I=(n()-.5)*r;d[g]=N,d[g+1]=R,d[g+2]=I,m[g]=N,m[g+1]=R,m[g+2]=I;const ie=Math.pow(n(),.9)*.48;if(p.copy(M.pearl).lerp(M.gold,ie),n()>.82&&p.lerp(M.amber,.08+n()*.12),p.lerp(M.ice,.18+n()*.22),n()>.72){const le=n()>.66?M.prismPink:n()>.5?M.prismBlue:M.prismLilac;p.lerp(le,.38+n()*.22)}c.setColorAt(w,p),f[w]=b.lerp(a[0],a[1],Math.pow(n(),2.2)),s[w]=b.lerp(x[0],x[1],n()),u[w]=b.lerp(v[0],v[1],n()),i[w]=n()*Math.PI*2,l[w]=n()*Math.PI*2,h[g]=b.lerp(-.2,.2,n()),h[g+1]=b.lerp(-.28,.28,n()),h[g+2]=b.lerp(-.18,.18,n())}return c.instanceColor&&(c.instanceColor.needsUpdate=!0),c.userData={base:d,positions:m,sizes:f,alphas:s,speeds:u,phases:i,rotations:l,spin:h,spreadX:o},B({mesh:c},0,0),{mesh:c}}function Fe(){const e=new W,o=[[-3.35,-.35,.45],[-2.32,.76,-.14],[-1.08,.12,.62],[.08,.94,-.36],[1.28,.2,.5],[2.34,-.82,-.12],[3.38,.08,.42],[-.1,-1.05,.3]].map(([f,s,u])=>new V(f,s,u)),t=new _(te(),ne(.78),o.length);t.instanceMatrix.setUsage(j),t.frustumCulled=!1;const r=new E;o.forEach((f,s)=>{const u=s%3===0?M.gold:M.ice.clone().lerp(M.amber,.28);r.position.copy(f),r.rotation.set(s*.6,s*.9,s*.32),r.scale.setScalar(s%3===0?.34:.24),r.updateMatrix(),t.setMatrixAt(s,r.matrix),t.setColorAt(s,u)}),t.instanceMatrix.needsUpdate=!0,t.instanceColor&&(t.instanceColor.needsUpdate=!0);const a=[];[[0,1],[1,2],[2,3],[2,7],[3,4],[4,5],[4,6],[7,5]].forEach(([f,s])=>{const u=o[f],i=o[s];for(let l=0;l<18;l++){const h=l/18,P=(l+.66)/18,c=u.clone().lerp(i,h),p=u.clone().lerp(i,Math.min(P,1));a.push(c.x,c.y,c.z,p.x,p.y,p.z)}});const v=new H;v.setAttribute("position",new ue(a,3));const d=new X({color:13872487,transparent:!0,opacity:.38,blending:Y,depthWrite:!1}),m=new he(v,d);return m.userData.baseOpacity=d.opacity,e.add(m,t),e.position.set(.65,.2,.25),e.rotation.set(-.18,-.22,.08),e.scale.setScalar(.94),{group:e,nodes:t,links:m}}function Ae(){const e=new W,o=new X({color:13081941,transparent:!0,opacity:.2,blending:Y,depthWrite:!1});for(let t=0;t<5;t++){const r=[],a=2.2+t*.7,x=160;for(let d=0;d<=x;d++){const m=d/x*Math.PI*2;r.push(new V(Math.cos(m)*a*1.9,Math.sin(m)*a*.26,0))}const v=new we(new H().setFromPoints(r),o.clone());v.rotation.set(-.58+t*.018,.08,-.025),v.position.set(.55,-.04+t*.02,-.4-t*.18),v.userData.spin=.018+t*.006,e.add(v)}return e}function De(){const e=new k({transparent:!0,depthWrite:!1,blending:ge,uniforms:{uTime:{value:0},uColorA:{value:new y("#fff7e4")},uColorB:{value:new y("#c79748")}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - 0.5;
        float d = length(uv);
        float pulse = 0.88 + sin(uTime * 1.7) * 0.12;
        float core = smoothstep(0.28 * pulse, 0.0, d) * 0.14;
        float halo = smoothstep(0.5, 0.08, d) * 0.12;
        vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 0.38, d));
        gl_FragColor = vec4(color, core + halo);
      }
    `}),o=new q(new Z(9.5,9.5),e);return o.position.set(.78,.05,-1.35),o.userData.material=e,o}function ze(){const e=new k({transparent:!0,depthWrite:!1,uniforms:{uTime:{value:0}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform float uTime;
      varying vec2 vUv;

      float wave(vec2 p) {
        return sin(p.x * 12.0 + uTime * 0.36) * 0.5 + sin((p.x + p.y) * 8.0 - uTime * 0.26) * 0.5;
      }

      void main() {
        vec2 uv = vUv - 0.5;
        float d = length(uv);
        float plume = smoothstep(0.52, 0.0, abs(uv.y + wave(uv) * 0.035)) * smoothstep(0.72, 0.16, d);
        float leftGlow = smoothstep(0.62, 0.0, length(uv - vec2(-0.28, 0.12))) * 0.18;
        vec3 color = mix(vec3(0.94, 0.91, 0.86), vec3(0.82, 0.66, 0.38), plume);
        gl_FragColor = vec4(color, plume * 0.14 + leftGlow * 0.55);
      }
    `}),o=new q(new Z(24,13.5),e);return o.position.set(0,0,-8),o.userData.material=e,o}function B(e,o,t){const{base:r,positions:a,sizes:x,alphas:v,speeds:d,phases:m,rotations:f,spin:s,spreadX:u}=e.mesh.userData;for(let i=0;i<d.length;i++){const l=i*3,h=m[i],P=d[i],c=o*P;let p=r[l]+Math.sin(c+h)*.22+t*.02;const w=r[l+1]+Math.sin(c*.9+h*1.7)*.18,g=r[l+2]+Math.cos(c*.7+h)*.28;p+=o*P*.18,p>u*.5&&(p-=u),a[l]=p,a[l+1]=w,a[l+2]=g;const A=x[i]*(.018+v[i]*.035)*(1+Math.sin(o*.8+h)*.08);D.position.set(p,w,g),D.rotation.set(f[i]*.45+o*s[l]+Math.sin(o*.22+h)*.16,f[i]+o*s[l+1],f[i]*.7+o*s[l+2]),D.scale.set(A*1.18,A,A*.92),D.updateMatrix(),e.mesh.setMatrixAt(i,D.matrix)}e.mesh.instanceMatrix.needsUpdate=!0}function re(){const e=window.innerWidth,o=window.innerHeight,t=Math.min(window.devicePixelRatio||1,2);U.setPixelRatio(t),U.setSize(e,o,!1),z.aspect=e/o,z.position.z=e/o<.8?16.5:12.5,z.updateProjectionMatrix(),C.traverse(r=>{var x;const a=r.material;(x=a==null?void 0:a.uniforms)!=null&&x.uPixelRatio&&(a.uniforms.uPixelRatio.value=t)})}function se(){const e=Pe.getElapsedTime();S.lerp(T,.055),B($,e,-1),B(ee,e,1),F.rotation.x=-.035+S.y*.055+Math.sin(e*.18)*.012,F.rotation.y=S.x*.09+Math.sin(e*.12)*.018,F.position.x=S.x*.26,F.position.y=-S.y*.16,L.group.rotation.y=-.22+e*.045+S.x*.08,L.group.rotation.x=-.18+Math.sin(e*.36)*.035,L.links.material.opacity=.25+Math.sin(e*1.4)*.065,oe.children.forEach((o,t)=>{o.rotation.z+=o.userData.spin*.01,o.material.opacity=.13+Math.sin(e*.7+t)*.055}),C.traverse(o=>{var r,a;const t=(r=o.userData)==null?void 0:r.material;(a=t==null?void 0:t.uniforms)!=null&&a.uTime&&(t.uniforms.uTime.value=e)}),U.render(C,z),requestAnimationFrame(se)}window.addEventListener("resize",re);window.addEventListener("pointermove",e=>{T.x=(e.clientX/window.innerWidth-.5)*2,T.y=(e.clientY/window.innerHeight-.5)*2});re();se();
