import { useState, useRef, useEffect, useCallback } from "react";

const WB_TOOLS = {
  HAND: "hand", SELECT: "select", PEN: "pen", LINE: "line",
  ARROW: "arrow", RECT: "rect", ELLIPSE: "ellipse", TEXT: "text", ERASER: "eraser",
};

const WB_COLORS = [
  "#000000","#334155","#ef4444","#f97316","#eab308",
  "#22c55e","#3b82f6","#8b5cf6","#ec4899","#06b6d4",
  "#a3e635","#fb923c","#f472b6","#34d399","#60a5fa","#ffffff",
];
const WB_SIZES  = [1, 2, 4, 6, 10, 16];
const WB_FONTS  = ["Virgil, cursive", "serif", "monospace", "sans-serif"];
const PEN_PRESETS = [
  { label: "Thin",   size: 1 },
  { label: "Medium", size: 3 },
  { label: "XL",     size: 7 },
  { label: "XXL",    size: 14 },
];

// TABS REMOVED — commented out per request
// const WB_NAV_TABS = [
//   { id: "courses",     icon: "📚", label: "Courses" },
//   { id: "quiz-python", icon: "🐍", label: "Python Quiz" },
//   { id: "quiz-mysql",  icon: "🗄️", label: "MySQL Quiz" },
//   { id: "ml-visuals",  icon: "🤖", label: "ML Visuals" },
//   { id: "py-visuals",  icon: "🐍", label: "Py Visuals" },
//   { id: "whiteboard",  icon: "✏️", label: "Whiteboard" },
// ];

function uid() { return Math.random().toString(36).slice(2, 11); }

function canvasXY(e, canvas) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width, sy = canvas.height / r.height;
  const src = e.touches ? e.touches[0] : e;
  return { x: (src.clientX - r.left) * sx, y: (src.clientY - r.top) * sy };
}

function drawEl(ctx, el, sel) {
  ctx.save();
  ctx.strokeStyle = el.color || "#000";
  ctx.fillStyle   = el.fill  || "transparent";
  ctx.lineWidth   = el.size  || 2;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  ctx.globalAlpha = el.opacity ?? 1;

  switch (el.type) {
    case "pen": {
      const pts = el.points;
      if (!pts || pts.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i+1].x) * 0.5;
        const my = (pts[i].y + pts[i+1].y) * 0.5;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length-1].x, pts[pts.length-1].y);
      ctx.stroke();
      break;
    }
    case "line":
      ctx.beginPath(); ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2); ctx.stroke();
      break;
    case "arrow": {
      ctx.beginPath(); ctx.moveTo(el.x1,el.y1); ctx.lineTo(el.x2,el.y2); ctx.stroke();
      const a = Math.atan2(el.y2-el.y1, el.x2-el.x1);
      const hl = Math.max(12,(el.size||2)*4);
      ctx.beginPath();
      ctx.moveTo(el.x2,el.y2);
      ctx.lineTo(el.x2-hl*Math.cos(a-Math.PI/7), el.y2-hl*Math.sin(a-Math.PI/7));
      ctx.lineTo(el.x2-hl*Math.cos(a+Math.PI/7), el.y2-hl*Math.sin(a+Math.PI/7));
      ctx.closePath(); ctx.fillStyle=el.color||"#000"; ctx.fill();
      break;
    }
    case "rect": {
      const w=el.x2-el.x1, h=el.y2-el.y1;
      if (el.fill&&el.fill!=="transparent") ctx.fillRect(el.x1,el.y1,w,h);
      ctx.strokeRect(el.x1,el.y1,w,h);
      break;
    }
    case "ellipse": {
      const cx=(el.x1+el.x2)/2, cy=(el.y1+el.y2)/2;
      const rx=Math.abs(el.x2-el.x1)/2, ry=Math.abs(el.y2-el.y1)/2;
      ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,2*Math.PI);
      if (el.fill&&el.fill!=="transparent") ctx.fill();
      ctx.stroke();
      break;
    }
    case "text": {
      ctx.font=`${el.fontSize||20}px ${el.fontFamily||"Virgil, cursive"}`;
      ctx.fillStyle=el.color||"#000";
      (el.text||"").split("\n").forEach((ln,i)=>{
        ctx.fillText(ln, el.x, el.y+i*(el.fontSize||20)*1.35);
      });
      break;
    }
    case "image":
      if (el._img) ctx.drawImage(el._img, el.x1, el.y1, el.x2-el.x1, el.y2-el.y1);
      break;
    default: break;
  }

  if (sel) {
    const b = bbox(el);
    if (b) {
      ctx.setLineDash([5,3]);
      ctx.strokeStyle="#6366f1"; ctx.lineWidth=1.5; ctx.globalAlpha=0.9;
      ctx.strokeRect(b.x-8, b.y-8, b.w+16, b.h+16);
      ctx.setLineDash([]);
      getResizeHandles(b).forEach(h => {
        ctx.globalAlpha=1;
        ctx.fillStyle="#ffffff"; ctx.strokeStyle="#6366f1"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.rect(h.x-5, h.y-5, 10, 10);
        ctx.fill(); ctx.stroke();
      });
    }
  }
  ctx.restore();
}

function bbox(el) {
  switch(el.type) {
    case "pen": {
      if (!el.points?.length) return null;
      const xs=el.points.map(p=>p.x), ys=el.points.map(p=>p.y);
      const x=Math.min(...xs),y=Math.min(...ys);
      return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};
    }
    case "line": case "arrow":
      return {x:Math.min(el.x1,el.x2),y:Math.min(el.y1,el.y2),w:Math.abs(el.x2-el.x1),h:Math.abs(el.y2-el.y1)};
    case "rect": case "ellipse": case "image":
      return {x:Math.min(el.x1,el.x2),y:Math.min(el.y1,el.y2),w:Math.abs(el.x2-el.x1),h:Math.abs(el.y2-el.y1)};
    case "text":
      return {x:el.x,y:el.y-(el.fontSize||20),w:220,h:(el.fontSize||20)*1.5};
    default: return null;
  }
}

function getResizeHandles(b) {
  const {x,y,w,h}=b;
  const lx=x-8, cx=x-8+(w+16)/2, rx=x+w+8;
  const ty=y-8, cy=y-8+(h+16)/2, by=y+h+8;
  return [
    {pos:"nw",x:lx,y:ty},{pos:"n",x:cx,y:ty},{pos:"ne",x:rx,y:ty},
    {pos:"e",x:rx,y:cy},{pos:"se",x:rx,y:by},{pos:"s",x:cx,y:by},
    {pos:"sw",x:lx,y:by},{pos:"w",x:lx,y:cy},
  ];
}

function getHandleAtPoint(el, px, py) {
  const b=bbox(el); if(!b) return null;
  for (const h of getResizeHandles(b)) {
    if (Math.abs(px-h.x)<=8 && Math.abs(py-h.y)<=8) return h.pos;
  }
  return null;
}

function resizeEl(el, handlePos, dx, dy, startBbox, startEl) {
  const b=startBbox;
  let nx1=b.x, ny1=b.y, nx2=b.x+b.w, ny2=b.y+b.h;
  if (handlePos.includes("n")) ny1+=dy;
  if (handlePos.includes("s")) ny2+=dy;
  if (handlePos.includes("w")) nx1+=dx;
  if (handlePos.includes("e")) nx2+=dx;
  if (nx2-nx1<10){if(handlePos.includes("w"))nx1=nx2-10;else nx2=nx1+10;}
  if (ny2-ny1<10){if(handlePos.includes("n"))ny1=ny2-10;else ny2=ny1+10;}
  switch(el.type){
    case "rect":case "ellipse":case "image":
      return {...startEl,x1:nx1,y1:ny1,x2:nx2,y2:ny2};
    case "line":case "arrow":
      if(handlePos==="nw"||handlePos==="w"||handlePos==="sw"||handlePos==="n")
        return {...startEl,x1:nx1,y1:ny1};
      return {...startEl,x2:nx2,y2:ny2};
    case "pen":{
      const scX=b.w>0?(nx2-nx1)/b.w:1, scY=b.h>0?(ny2-ny1)/b.h:1;
      return {...startEl,points:startEl.points.map(p=>({x:nx1+(p.x-b.x)*scX,y:ny1+(p.y-b.y)*scY}))};
    }
    case "text":
      return {...startEl,x:nx1,y:ny1+(startEl.fontSize||20),fontSize:Math.max(10,(startEl.fontSize||20)*((ny2-ny1)/Math.max(b.h,1)))};
    default: return startEl;
  }
}

function hit(el, px, py) {
  const b=bbox(el); if(!b) return false;
  return px>=b.x-8&&px<=b.x+b.w+8&&py>=b.y-8&&py<=b.y+b.h+8;
}

function moveEl(el, dx, dy) {
  switch(el.type){
    case "pen": return {...el,points:el.points.map(p=>({x:p.x+dx,y:p.y+dy}))};
    case "line":case "arrow":case "rect":case "ellipse":case "image":
      return {...el,x1:el.x1+dx,y1:el.y1+dy,x2:el.x2+dx,y2:el.y2+dy};
    case "text": return {...el,x:el.x+dx,y:el.y+dy};
    default: return el;
  }
}

const RESIZE_CURSORS={nw:"nw-resize",n:"n-resize",ne:"ne-resize",e:"e-resize",se:"se-resize",s:"s-resize",sw:"sw-resize",w:"w-resize"};

export default function WhiteBoard({ onTabChange }) {
  const cvRef       = useRef(null);
  const ctRef       = useRef(null);
  const textRef     = useRef(null);
  const fileImgRef  = useRef(null);
  const filePdfRef  = useRef(null);
  const fileJsonRef = useRef(null);
  const rafRef      = useRef(null);

  const [tool,       setTool]       = useState(WB_TOOLS.PEN);
  const [color,      setColor]      = useState("#000000");
  const [fillColor,  setFillColor]  = useState("transparent");
  const [strokeSize, setStrokeSize] = useState(2);
  const [fontSize,   setFontSize]   = useState(20);
  const [fontFamily, setFontFamily] = useState("Virgil, cursive");
  const [opacity,    setOpacity]    = useState(1);

  const [elements,    setElements]    = useState([]);
  const [history,     setHistory]     = useState([[]]);
  const [histIdx,     setHistIdx]     = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDrawing,   setIsDrawing]   = useState(false);
  const [current,     setCurrent]     = useState(null);

  const [textPos,  setTextPos]  = useState(null);
  const [textVal,  setTextVal]  = useState("");
  const [showText, setShowText] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });

  const panGesture    = useRef(null);
  const isPanning     = useRef(false);
  const isDraggingEl  = useRef(false);
  const dragStart     = useRef(null);
  const dragSnapshot  = useRef([]);
  const isResizing    = useRef(false);
  const resizeHandle  = useRef(null);
  const resizeStart   = useRef(null);
  const resizeSnapshot= useRef(null);

  const [gridOn,          setGridOn]          = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFillPicker,  setShowFillPicker]  = useState(false);
  const [showPenPicker,   setShowPenPicker]   = useState(false);
  const [toolbarCollapsed,setToolbarCollapsed]= useState(false);
  const [cursorOverride,  setCursorOverride]  = useState(null);

  const S = useRef({});
  S.current = {
    elements, zoom, pan, tool, color, fillColor, strokeSize,
    fontSize, fontFamily, opacity, isDrawing, current, selectedIds, gridOn,
  };

  const kick = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const cv=cvRef.current; if(!cv) return;
      const ctx=cv.getContext("2d");
      const {elements:els,zoom:z,pan:p,selectedIds:sel,current:cur,gridOn:grid}=S.current;

      // ── ALWAYS WHITE ──
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,cv.width,cv.height);

      if (grid) {
        const gs=40*z,ox=((p.x%gs)+gs)%gs,oy=((p.y%gs)+gs)%gs;
        ctx.save();
        ctx.strokeStyle="rgba(0,0,0,0.05)"; ctx.lineWidth=1;
        for(let x=ox;x<cv.width;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,cv.height);ctx.stroke();}
        for(let y=oy;y<cv.height;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cv.width,y);ctx.stroke();}
        ctx.restore();
      }

      ctx.save(); ctx.translate(p.x,p.y); ctx.scale(z,z);
      els.forEach(el=>drawEl(ctx,el,sel.includes(el.id)));
      if(cur) drawEl(ctx,cur,false);
      ctx.restore();
    });
  }, []);

  useEffect(()=>{
    const resize=()=>{
      const cv=cvRef.current,ct=ctRef.current; if(!cv||!ct) return;
      cv.width=ct.clientWidth; cv.height=ct.clientHeight; kick();
    };
    resize();
    const ro=new ResizeObserver(resize);
    if(ctRef.current) ro.observe(ctRef.current);
    return ()=>ro.disconnect();
  },[kick]);

  useEffect(()=>{ kick(); },[elements,current,zoom,pan,selectedIds,gridOn,kick]);

  const pushHist=useCallback((ne)=>{
    setHistory(h=>[...h.slice(0,histIdx+1),ne]);
    setHistIdx(i=>i+1);
  },[histIdx]);

  const undo=useCallback(()=>{
    if(histIdx<=0) return;
    setElements(history[histIdx-1]); setHistIdx(i=>i-1);
  },[history,histIdx]);

  const redo=useCallback(()=>{
    if(histIdx>=history.length-1) return;
    setElements(history[histIdx+1]); setHistIdx(i=>i+1);
  },[history,histIdx]);

  useEffect(()=>{
    const onKey=e=>{
      if(e.target.tagName==="TEXTAREA"||e.target.tagName==="INPUT") return;
      if((e.ctrlKey||e.metaKey)&&e.key==="z"){e.preventDefault();undo();}
      if((e.ctrlKey||e.metaKey)&&e.key==="y"){e.preventDefault();redo();}
      if(e.key==="Delete"||e.key==="Backspace"){
        const{selectedIds:sel,elements:els}=S.current;
        if(sel.length){const ne=els.filter(el=>!sel.includes(el.id));setElements(ne);setSelectedIds([]);pushHist(ne);}
      }
      const map={h:WB_TOOLS.HAND,v:WB_TOOLS.SELECT,p:WB_TOOLS.PEN,l:WB_TOOLS.LINE,a:WB_TOOLS.ARROW,r:WB_TOOLS.RECT,e:WB_TOOLS.ELLIPSE,t:WB_TOOLS.TEXT,x:WB_TOOLS.ERASER};
      if(map[e.key]) setTool(map[e.key]);
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[undo,redo,pushHist]);

  const toWorld=(sx,sy)=>({x:(sx-S.current.pan.x)/S.current.zoom,y:(sy-S.current.pan.y)/S.current.zoom});
  const worldOf=e=>{const s=canvasXY(e,cvRef.current);return toWorld(s.x,s.y);};
  const screenOf=e=>canvasXY(e,cvRef.current);

  const onDown=useCallback(e=>{
    e.preventDefault();
    const{tool:t,color:c,fillColor:fc,strokeSize:ss,opacity:op,elements:els,selectedIds:sel}=S.current;
    if(e.button===1||t===WB_TOOLS.HAND){
      const sp=screenOf(e);
      panGesture.current={ox:S.current.pan.x,oy:S.current.pan.y,mx:sp.x,my:sp.y};
      isPanning.current=true; cvRef.current?.setPointerCapture?.(e.pointerId); return;
    }
    if(t===WB_TOOLS.SELECT){
      const wp=worldOf(e);
      if(sel.length===1){
        const selEl=els.find(el=>el.id===sel[0]);
        if(selEl){
          const hpos=getHandleAtPoint(selEl,wp.x,wp.y);
          if(hpos){
            isResizing.current=true; resizeHandle.current=hpos;
            resizeStart.current={wx:wp.x,wy:wp.y};
            resizeSnapshot.current={el:{...selEl,points:selEl.points?[...selEl.points]:undefined},bbox:bbox(selEl)};
            cvRef.current?.setPointerCapture?.(e.pointerId);
            setCursorOverride(RESIZE_CURSORS[hpos]); return;
          }
        }
      }
      const found=[...els].reverse().find(el=>hit(el,wp.x,wp.y));
      if(found){
        setSelectedIds([found.id]); isDraggingEl.current=true;
        dragStart.current={x:wp.x,y:wp.y};
        dragSnapshot.current=els.map(el=>({...el,points:el.points?[...el.points]:undefined}));
        cvRef.current?.setPointerCapture?.(e.pointerId);
      }else{setSelectedIds([]);isDraggingEl.current=false;}
      return;
    }
    if(t===WB_TOOLS.ERASER){
      const wp=worldOf(e);
      const idx=[...els].reverse().findIndex(el=>hit(el,wp.x,wp.y));
      if(idx!==-1){const ri=els.length-1-idx;const ne=els.filter((_,i)=>i!==ri);setElements(ne);pushHist(ne);}
      return;
    }
    if(t===WB_TOOLS.TEXT){
      const wp=worldOf(e);
      setTextPos(wp);setTextVal("");setShowText(true);
      setTimeout(()=>textRef.current?.focus(),50); return;
    }
    setIsDrawing(true);
    const wp=worldOf(e),id=uid();
    const nc=t===WB_TOOLS.PEN
      ?{id,type:"pen",points:[wp],color:c,size:ss,opacity:op}
      :{id,type:t,x1:wp.x,y1:wp.y,x2:wp.x,y2:wp.y,color:c,fill:fc,size:ss,opacity:op};
    setCurrent(nc); S.current.current=nc;
  // eslint-disable-next-line
  },[pushHist]);

  const onMove=useCallback(e=>{
    e.preventDefault();
    if(isPanning.current&&panGesture.current){
      const sp=screenOf(e),pg=panGesture.current;
      const np={x:pg.ox+sp.x-pg.mx,y:pg.oy+sp.y-pg.my};
      S.current.pan=np; setPan(np); kick(); return;
    }
    if(isResizing.current&&resizeHandle.current&&resizeSnapshot.current){
      const wp=worldOf(e);
      const dx=wp.x-resizeStart.current.wx,dy=wp.y-resizeStart.current.wy;
      const{el:snapEl,bbox:snapBbox}=resizeSnapshot.current;
      const resized=resizeEl(snapEl,resizeHandle.current,dx,dy,snapBbox,snapEl);
      const newEls=S.current.elements.map(el=>el.id===resized.id?resized:el);
      S.current.elements=newEls; setElements(newEls); kick(); return;
    }
    if(isDraggingEl.current&&dragStart.current){
      const wp=worldOf(e);
      const dx=wp.x-dragStart.current.x,dy=wp.y-dragStart.current.y;
      const sel=S.current.selectedIds;
      const moved=dragSnapshot.current.map(el=>sel.includes(el.id)?moveEl(el,dx,dy):el);
      S.current.elements=moved; setElements(moved); kick(); return;
    }
    if(S.current.tool===WB_TOOLS.SELECT&&!isDraggingEl.current){
      const wp=worldOf(e),sel=S.current.selectedIds;
      if(sel.length===1){
        const selEl=S.current.elements.find(el=>el.id===sel[0]);
        if(selEl){const hpos=getHandleAtPoint(selEl,wp.x,wp.y);setCursorOverride(hpos?RESIZE_CURSORS[hpos]:null);}
      }else setCursorOverride(null);
    }
    const{isDrawing:drawing,current:cur,tool:t}=S.current;
    if(!drawing||!cur) return;
    const wp=worldOf(e);
    const nc=t===WB_TOOLS.PEN?{...cur,points:[...cur.points,wp]}:{...cur,x2:wp.x,y2:wp.y};
    S.current.current=nc; setCurrent(nc); kick();
  // eslint-disable-next-line
  },[kick]);

  const onUp=useCallback(e=>{
    if(isPanning.current){isPanning.current=false;panGesture.current=null;cvRef.current?.releasePointerCapture?.(e.pointerId);return;}
    if(isResizing.current){
      isResizing.current=false;resizeHandle.current=null;resizeStart.current=null;resizeSnapshot.current=null;
      setCursorOverride(null);cvRef.current?.releasePointerCapture?.(e.pointerId);pushHist(S.current.elements);return;
    }
    if(isDraggingEl.current){isDraggingEl.current=false;cvRef.current?.releasePointerCapture?.(e.pointerId);pushHist(S.current.elements);return;}
    const{current:cur,isDrawing:drawing,elements:els}=S.current;
    if(!drawing||!cur) return;
    setIsDrawing(false);
    let valid=true;
    if(cur.type==="pen"&&cur.points?.length<2) valid=false;
    if(["line","arrow","rect","ellipse"].includes(cur.type)){if(Math.abs((cur.x2||0)-(cur.x1||0))<2&&Math.abs((cur.y2||0)-(cur.y1||0))<2)valid=false;}
    if(valid){const ne=[...els,cur];setElements(ne);pushHist(ne);}
    setCurrent(null);S.current.current=null;
  // eslint-disable-next-line
  },[pushHist]);

  const submitText=()=>{
    if(!textVal.trim()||!textPos){setShowText(false);return;}
    const el={id:uid(),type:"text",x:textPos.x,y:textPos.y,text:textVal,color,fontSize,fontFamily,opacity};
    const ne=[...elements,el];setElements(ne);pushHist(ne);
    setShowText(false);setTextVal("");setTextPos(null);
  };

  const onWheel=useCallback(e=>{
    e.preventDefault();
    const cv=cvRef.current,r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width),my=(e.clientY-r.top)*(cv.height/r.height);
    const handActive=S.current.tool===WB_TOOLS.HAND,wantZoom=e.ctrlKey||e.metaKey||!handActive;
    if(!wantZoom){const np={x:S.current.pan.x-e.deltaX,y:S.current.pan.y-e.deltaY};S.current.pan=np;setPan(np);kick();return;}
    const factor=e.deltaY>0?0.92:1.08,z=S.current.zoom,nz=Math.min(8,Math.max(0.05,z*factor));
    const np={x:mx-(mx-S.current.pan.x)*(nz/z),y:my-(my-S.current.pan.y)*(nz/z)};
    S.current.zoom=nz;S.current.pan=np;setZoom(nz);setPan(np);kick();
  },[kick]);
  useEffect(()=>{const cv=cvRef.current;if(!cv)return;cv.addEventListener("wheel",onWheel,{passive:false});return()=>cv.removeEventListener("wheel",onWheel);},[onWheel]);

  const handleImage=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const img=new Image();
      img.onload=()=>{
        const maxW=600,maxH=400,sc=Math.min(maxW/img.width,maxH/img.height,1),w=img.width*sc,h=img.height*sc;
        const cv=cvRef.current,cx=(cv.width/2-S.current.pan.x)/S.current.zoom,cy=(cv.height/2-S.current.pan.y)/S.current.zoom;
        const el={id:uid(),type:"image",x1:cx-w/2,y1:cy-h/2,x2:cx+w/2,y2:cy+h/2,_img:img,src:ev.target.result,opacity:1};
        const ne=[...S.current.elements,el];setElements(ne);pushHist(ne);
      };
      img.src=ev.target.result;
    };
    reader.readAsDataURL(file);e.target.value="";
  };
  const handlePdf=async e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=async ev=>{
      try{
        const pdfjsLib=window.pdfjsLib;if(!pdfjsLib){alert("PDF.js not loaded.");return;}
        const pdf=await pdfjsLib.getDocument({data:new Uint8Array(ev.target.result)}).promise;
        const page=await pdf.getPage(1);
        const vp=page.getViewport({scale:1.5});
        const off=document.createElement("canvas");off.width=vp.width;off.height=vp.height;
        await page.render({canvasContext:off.getContext("2d"),viewport:vp}).promise;
        const img=new Image();
        img.onload=()=>{
          const maxW=800,maxH=600,sc=Math.min(maxW/img.width,maxH/img.height,1),w=img.width*sc,h=img.height*sc;
          const cv=cvRef.current,cx=(cv.width/2-S.current.pan.x)/S.current.zoom,cy=(cv.height/2-S.current.pan.y)/S.current.zoom;
          const el={id:uid(),type:"image",x1:cx-w/2,y1:cy-h/2,x2:cx+w/2,y2:cy+h/2,_img:img,opacity:1};
          const ne=[...S.current.elements,el];setElements(ne);pushHist(ne);
        };
        img.src=off.toDataURL();
      }catch(err){console.error(err);}
    };
    reader.readAsArrayBuffer(file);e.target.value="";
  };
  const handleJson=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        const restored=(data.elements||[]).map(el=>{if(el.type==="image"&&el.src){const img=new Image();img.src=el.src;return{...el,_img:img};}return el;});
        setElements(restored);pushHist(restored);setSelectedIds([]);
      }catch{alert("Invalid JSON file");}
    };
    reader.readAsText(file);e.target.value="";
  };

  const savePng=()=>{const a=document.createElement("a");a.href=cvRef.current.toDataURL("image/png");a.download="whiteboard.png";a.click();};
  const saveJson=()=>{
    const data=JSON.stringify({version:1,elements:elements.map(({_img,...r})=>r)},null,2);
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="whiteboard.json";a.click();
  };
  const saveSvg=()=>{
    const cv=cvRef.current;
    const parts=elements.map(el=>{
      switch(el.type){
        case "rect":return`<rect x="${el.x1}" y="${el.y1}" width="${el.x2-el.x1}" height="${el.y2-el.y1}" stroke="${el.color}" stroke-width="${el.size}" fill="${el.fill||'none'}" opacity="${el.opacity??1}"/>`;
        case "ellipse":{const cx=(el.x1+el.x2)/2,cy=(el.y1+el.y2)/2;return`<ellipse cx="${cx}" cy="${cy}" rx="${Math.abs(el.x2-el.x1)/2}" ry="${Math.abs(el.y2-el.y1)/2}" stroke="${el.color}" stroke-width="${el.size}" fill="${el.fill||'none'}" opacity="${el.opacity??1}"/>`;}
        case "line":case "arrow":return`<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.color}" stroke-width="${el.size}" opacity="${el.opacity??1}"/>`;
        case "pen":{const d=el.points.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");return`<path d="${d}" stroke="${el.color}" stroke-width="${el.size}" fill="none" opacity="${el.opacity??1}"/>`;}
        case "text":return`<text x="${el.x}" y="${el.y}" fill="${el.color}" font-size="${el.fontSize}" font-family="${el.fontFamily}" opacity="${el.opacity??1}">${el.text}</text>`;
        default:return"";
      }
    });
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${cv.width}" height="${cv.height}" style="background:#fff">${parts.join("")}</svg>`;
    const blob=new Blob([svg],{type:"image/svg+xml"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="whiteboard.svg";a.click();
  };
  const clearAll=()=>{setElements([]);pushHist([]);setSelectedIds([]);};

  const getCursor=()=>{
    if(cursorOverride) return cursorOverride;
    if(S.current.tool===WB_TOOLS.HAND) return isPanning.current?"grabbing":"grab";
    if(isPanning.current) return "grabbing";
    if(isDraggingEl.current) return "grabbing";
    if(tool===WB_TOOLS.SELECT) return selectedIds.length?"move":"default";
    if(tool===WB_TOOLS.PEN) return "crosshair";
    if(tool===WB_TOOLS.ERASER) return "cell";
    if(tool===WB_TOOLS.TEXT) return "text";
    return "default";
  };

  const textScreenPos=textPos?{x:textPos.x*zoom+pan.x,y:textPos.y*zoom+pan.y}:{x:0,y:0};

  const toolList=[
    {id:WB_TOOLS.HAND,icon:"✋",label:"Hand/Pan (H)"},
    {id:WB_TOOLS.SELECT,icon:"↖",label:"Select & Move (V)"},
    {id:WB_TOOLS.PEN,icon:"✏",label:"Pen (P)"},
    {id:WB_TOOLS.LINE,icon:"╱",label:"Line (L)"},
    {id:WB_TOOLS.ARROW,icon:"→",label:"Arrow (A)"},
    {id:WB_TOOLS.RECT,icon:"▭",label:"Rect (R)"},
    {id:WB_TOOLS.ELLIPSE,icon:"○",label:"Ellipse (E)"},
    {id:WB_TOOLS.TEXT,icon:"T",label:"Text (T)"},
    {id:WB_TOOLS.ERASER,icon:"⌫",label:"Eraser (X)"},
  ];

  const panel={background:"rgba(255,255,255,0.97)",border:"1px solid rgba(0,0,0,0.09)",borderRadius:14,boxShadow:"0 4px 24px rgba(0,0,0,0.1)",backdropFilter:"blur(14px)",zIndex:200};
  const tbBtn=(active)=>({width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:active?"rgba(99,102,241,0.12)":"transparent",color:active?"#6366f1":"#444",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",outline:active?"1.5px solid rgba(99,102,241,0.4)":"none",transition:"all 0.12s"});
  const sep=<div style={{width:1,height:26,background:"rgba(0,0,0,0.09)",margin:"0 4px"}}/>;

  return (
    <div ref={ctRef} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#ffffff",overflow:"hidden",fontFamily:"system-ui,sans-serif",zIndex:9999}}>
      <style>{`
        @keyframes wbFloat{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-5px)}}
        @keyframes wbFadeIn{from{opacity:0;transform:translateX(-50%) translateY(-14px) scale(0.96)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
        @keyframes wbSideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        .wb-toolbar{animation:wbFadeIn 0.3s cubic-bezier(.22,1,.36,1) both,wbFloat 5s ease-in-out 0.4s infinite}
        .wb-toolbar:hover{animation:wbFadeIn 0s both!important}
        .wb-sidebar-el{animation:wbSideIn 0.28s cubic-bezier(.22,1,.36,1) both}
        .wbt:hover{background:rgba(99,102,241,0.08)!important;transform:scale(1.1)}
        .wbt{transition:background 0.12s,transform 0.12s!important}
        .wbp:hover{background:rgba(99,102,241,0.06)!important}
        .wb-nav-tab{display:flex;align-items:center;gap:5px;padding:5px 11px;border:none;border-radius:8px;cursor:pointer;font-size:11.5px;font-weight:600;background:transparent;color:#666;transition:all 0.18s;white-space:nowrap;letter-spacing:0.2px}
        .wb-nav-tab:hover{background:rgba(13,148,136,0.08);color:#0d9488}
        .wb-nav-tab.wb-active{background:rgba(13,148,136,0.12);color:#0d9488;outline:1.5px solid rgba(13,148,136,0.35);border-radius:8px}
      `}</style>

      {/* Canvas */}
      <canvas ref={cvRef}
        style={{position:"absolute",inset:0,cursor:getCursor(),touchAction:"none",display:"block",background:"#ffffff",width:"100%",height:"100%"}}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}
      />

      {/* Text overlay */}
      {showText&&textPos&&(
        <textarea ref={textRef} value={textVal} onChange={e=>setTextVal(e.target.value)}
          onKeyDown={e=>{if(e.key==="Escape"){setShowText(false);setTextVal("");}if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitText();}}}
          onBlur={submitText}
          style={{position:"absolute",left:textScreenPos.x,top:textScreenPos.y-4,background:"rgba(255,255,255,0.97)",color,border:"1.5px dashed #6366f1",outline:"none",fontSize:`${fontSize*zoom}px`,fontFamily,padding:"4px 8px",minWidth:120,minHeight:32,resize:"none",zIndex:1000,borderRadius:6,lineHeight:1.4,boxShadow:"0 2px 12px rgba(99,102,241,0.15)"}}
          placeholder="Type…"
        />
      )}

      {/* ── FLOATING TOP TOOLBAR ── */}
      {!toolbarCollapsed&&(
        <div className="wb-toolbar" style={{position:"absolute",top:14,left:"50%",display:"flex",alignItems:"center",gap:3,...panel,padding:"5px 10px",flexWrap:"wrap",maxWidth:"calc(100% - 120px)"}}>

          {/* TABS REMOVED — commented out per request */}
          {/* {WB_NAV_TABS.map(tab=>(
            <button key={tab.id}
              className={`wb-nav-tab${tab.id==="whiteboard"?" wb-active":""}`}
              onClick={()=>{if(tab.id!=="whiteboard"&&onTabChange) onTabChange(tab.id);}}
            >
              <span style={{fontSize:13}}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))} */}

          {/* DIVIDER REMOVED — was between tabs and tools */}
          {/* <div style={{width:1,height:28,background:"rgba(0,0,0,0.1)",margin:"0 6px",flexShrink:0}}/> */}

          {/* Drawing tools */}
          {toolList.map(t=>{
            const isPenTool=t.id===WB_TOOLS.PEN;
            return (
              <div key={t.id} style={{position:"relative"}}>
                <button className="wbt" title={t.label}
                  onClick={()=>{setTool(t.id);if(isPenTool){setShowPenPicker(v=>tool===WB_TOOLS.PEN?!v:true);setShowColorPicker(false);setShowFillPicker(false);}else setShowPenPicker(false);}}
                  style={{...tbBtn(tool===t.id),fontSize:t.id===WB_TOOLS.TEXT?14:17}}>
                  {t.icon}
                </button>
                {isPenTool&&showPenPicker&&tool===WB_TOOLS.PEN&&(
                  <div style={{position:"absolute",top:42,left:"50%",transform:"translateX(-50%)",background:"white",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,padding:"10px 12px",zIndex:9999,boxShadow:"0 8px 30px rgba(0,0,0,0.14)",display:"flex",flexDirection:"column",gap:6,minWidth:120}}>
                    <div style={{fontSize:10,color:"#999",textAlign:"center",fontWeight:600,letterSpacing:"0.5px",marginBottom:2}}>PEN SIZE</div>
                    {PEN_PRESETS.map(preset=>(
                      <button key={preset.label} onClick={()=>{setStrokeSize(preset.size);setShowPenPicker(false);}}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",border:"none",borderRadius:8,cursor:"pointer",background:strokeSize===preset.size?"rgba(99,102,241,0.12)":"transparent",outline:strokeSize===preset.size?"1.5px solid rgba(99,102,241,0.4)":"none",transition:"all 0.12s"}}>
                        <div style={{width:36,height:Math.max(preset.size,1),background:color||"#000",borderRadius:preset.size,flexShrink:0}}/>
                        <span style={{fontSize:12,color:"#333",fontWeight:strokeSize===preset.size?700:400}}>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {sep}

          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowColorPicker(v=>!v);setShowFillPicker(false);setShowPenPicker(false);}} title="Stroke color"
              style={{width:30,height:30,border:"2.5px solid rgba(0,0,0,0.18)",borderRadius:8,background:color,cursor:"pointer"}}/>
            {showColorPicker&&(
              <div style={{position:"absolute",top:42,left:"50%",transform:"translateX(-50%)",background:"white",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,padding:10,display:"flex",flexWrap:"wrap",gap:5,width:162,zIndex:9999,boxShadow:"0 8px 30px rgba(0,0,0,0.14)"}}>
                {WB_COLORS.map(c=>(
                  <div key={c} onClick={()=>{setColor(c);setShowColorPicker(false);}}
                    style={{width:24,height:24,borderRadius:6,background:c,cursor:"pointer",border:color===c?"2px solid #6366f1":"1px solid rgba(0,0,0,0.12)"}}/>
                ))}
                <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{width:"100%",height:28,border:"none",borderRadius:4,cursor:"pointer"}}/>
              </div>
            )}
          </div>

          <div style={{position:"relative"}}>
            <button onClick={()=>{setShowFillPicker(v=>!v);setShowColorPicker(false);setShowPenPicker(false);}} title="Fill color"
              style={{width:30,height:30,border:"2px solid rgba(0,0,0,0.1)",borderRadius:8,cursor:"pointer",background:fillColor==="transparent"?"linear-gradient(135deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(135deg,#ccc 25%,white 25%,white 75%,#ccc 75%)":fillColor,backgroundSize:"8px 8px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#555"}}>
              {fillColor==="transparent"?"∅":""}
            </button>
            {showFillPicker&&(
              <div style={{position:"absolute",top:42,left:"50%",transform:"translateX(-50%)",background:"white",border:"1px solid rgba(0,0,0,0.1)",borderRadius:12,padding:10,display:"flex",flexWrap:"wrap",gap:5,width:162,zIndex:9999,boxShadow:"0 8px 30px rgba(0,0,0,0.14)"}}>
                <div onClick={()=>{setFillColor("transparent");setShowFillPicker(false);}}
                  style={{width:24,height:24,borderRadius:6,cursor:"pointer",fontSize:11,color:"#555",border:fillColor==="transparent"?"2px solid #6366f1":"1px solid rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>∅</div>
                {WB_COLORS.map(c=>(
                  <div key={c} onClick={()=>{setFillColor(c);setShowFillPicker(false);}}
                    style={{width:24,height:24,borderRadius:6,background:c,cursor:"pointer",border:fillColor===c?"2px solid #6366f1":"1px solid rgba(0,0,0,0.1)"}}/>
                ))}
                <input type="color" value={fillColor==="transparent"?"#ffffff":fillColor} onChange={e=>setFillColor(e.target.value)} style={{width:"100%",height:28,border:"none",borderRadius:4,cursor:"pointer"}}/>
              </div>
            )}
          </div>

          {sep}

          {WB_SIZES.map(s=>(
            <button key={s} onClick={()=>setStrokeSize(s)} title={`Size ${s}`}
              style={{width:30,height:30,borderRadius:8,border:"none",cursor:"pointer",background:strokeSize===s?"rgba(99,102,241,0.1)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",outline:strokeSize===s?"1.5px solid rgba(99,102,241,0.4)":"none"}}>
              <div style={{width:Math.min(s+3,16),height:Math.min(s+3,16),borderRadius:"50%",background:"#333"}}/>
            </button>
          ))}

          {sep}

          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
            <span style={{fontSize:9,color:"#999"}}>Opacity</span>
            <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e=>setOpacity(+e.target.value)} style={{width:56,accentColor:"#6366f1"}}/>
          </div>
        </div>
      )}

      {/* Hamburger */}
      <button className="wbp" onClick={()=>setToolbarCollapsed(v=>!v)} title={toolbarCollapsed?"Show toolbar":"Hide toolbar"}
        style={{position:"absolute",top:14,right:14,width:38,height:38,border:"1px solid rgba(0,0,0,0.1)",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.96)",color:"#555",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,zIndex:300,boxShadow:"0 2px 10px rgba(0,0,0,0.1)",transition:"all 0.2s"}}>
        {toolbarCollapsed?<span style={{fontSize:18,lineHeight:1}}>☰</span>:<>
          <div style={{width:16,height:2,background:"currentColor",borderRadius:1}}/>
          <div style={{width:16,height:2,background:"currentColor",borderRadius:1}}/>
          <div style={{width:16,height:2,background:"currentColor",borderRadius:1}}/>
        </>}
      </button>

      {/* Left sidebar */}
      <div className="wb-sidebar-el" style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:5,...panel,padding:"8px 6px"}}>
        {[{icon:"↩",fn:undo,title:"Undo (Ctrl+Z)"},{icon:"↪",fn:redo,title:"Redo (Ctrl+Y)"},{icon:"🗑",fn:clearAll,title:"Clear all"},{icon:gridOn?"⊞":"□",fn:()=>setGridOn(g=>!g),title:"Toggle grid",active:gridOn}].map((b,i)=>(
          <button key={i} onClick={b.fn} title={b.title} className="wbp"
            style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:b.active?"rgba(99,102,241,0.1)":"transparent",color:b.active?"#6366f1":"#555",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",outline:b.active?"1.5px solid rgba(99,102,241,0.4)":"none"}}>
            {b.icon}
          </button>
        ))}
        <div style={{width:"100%",height:1,background:"rgba(0,0,0,0.07)"}}/>
        <button className="wbp" onClick={()=>fileImgRef.current.click()} title="Upload image" style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:"transparent",color:"#555",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>🖼</button>
        <input ref={fileImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
        <button className="wbp" onClick={()=>filePdfRef.current.click()} title="Upload PDF" style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:"transparent",color:"#555",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>📄</button>
        <input ref={filePdfRef} type="file" accept="application/pdf" style={{display:"none"}} onChange={handlePdf}/>
        <button className="wbp" onClick={()=>fileJsonRef.current.click()} title="Load JSON" style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:"transparent",color:"#555",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>📂</button>
        <input ref={fileJsonRef} type="file" accept="application/json,.json" style={{display:"none"}} onChange={handleJson}/>
        <div style={{width:"100%",height:1,background:"rgba(0,0,0,0.07)"}}/>
        {[{fn:savePng,label:"PNG"},{fn:saveSvg,label:"SVG"},{fn:saveJson,label:"JSON"}].map(b=>(
          <button key={b.label} className="wbp" onClick={b.fn} title={`Save ${b.label}`}
            style={{width:34,height:34,border:"none",borderRadius:8,cursor:"pointer",background:"transparent",color:"#555",fontSize:9,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:0}}>
            <span style={{fontSize:14}}>⬇</span><span>{b.label}</span>
          </button>
        ))}
      </div>

      {tool===WB_TOOLS.TEXT&&(
        <div style={{position:"absolute",bottom:70,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:8,...panel,borderRadius:10,padding:"6px 14px"}}>
          <span style={{fontSize:11,color:"#888"}}>Font:</span>
          {WB_FONTS.map(f=>(
            <button key={f} onClick={()=>setFontFamily(f)}
              style={{padding:"3px 10px",border:fontFamily===f?"1.5px solid #6366f1":"1px solid rgba(0,0,0,0.12)",borderRadius:6,background:fontFamily===f?"rgba(99,102,241,0.08)":"transparent",color:"#333",fontFamily:f,cursor:"pointer",fontSize:12}}>
              {f.split(",")[0]}
            </button>
          ))}
          <span style={{fontSize:11,color:"#888",marginLeft:8}}>Size:</span>
          {[14,18,24,32,48].map(s=>(
            <button key={s} onClick={()=>setFontSize(s)}
              style={{padding:"2px 8px",border:fontSize===s?"1.5px solid #6366f1":"1px solid rgba(0,0,0,0.12)",borderRadius:6,background:fontSize===s?"rgba(99,102,241,0.08)":"transparent",color:"#333",cursor:"pointer",fontSize:11,fontWeight:700}}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{position:"absolute",bottom:20,right:20,display:"flex",flexDirection:"column",alignItems:"center",gap:4,...panel,padding:8,borderRadius:12}}>
        <button onClick={()=>setZoom(z=>Math.min(8,z*1.25))} style={{width:30,height:30,border:"none",borderRadius:7,background:"rgba(99,102,241,0.07)",color:"#444",cursor:"pointer",fontSize:18,fontWeight:700}}>+</button>
        <span style={{fontSize:11,color:"#888",minWidth:38,textAlign:"center"}}>{Math.round(zoom*100)}%</span>
        <button onClick={()=>setZoom(z=>Math.max(0.05,z*0.8))} style={{width:30,height:30,border:"none",borderRadius:7,background:"rgba(99,102,241,0.07)",color:"#444",cursor:"pointer",fontSize:18,fontWeight:700}}>−</button>
        <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} title="Reset view" style={{width:30,height:30,border:"none",borderRadius:7,background:"rgba(99,102,241,0.05)",color:"#888",cursor:"pointer",fontSize:13}}>⊙</button>
      </div>

      <div style={{position:"absolute",bottom:20,left:60,display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.95)",border:"1px solid rgba(0,0,0,0.07)",borderRadius:8,padding:"5px 12px",zIndex:200,fontSize:11,color:"#888"}}>
        <span>{elements.length} elements</span>
        {selectedIds.length>0&&<span style={{color:"#6366f1"}}>{selectedIds.length} selected — drag to move · drag corner to resize</span>}
        <span>{tool===WB_TOOLS.HAND?"✋ Drag=Pan • Scroll=Pan • Ctrl+Scroll=Zoom":"Scroll=Zoom • Mid-drag=Pan • H=Hand"}</span>
      </div>

      <div style={{position:"absolute",top:68,right:58,fontSize:10,color:"rgba(0,0,0,0.27)",lineHeight:2,zIndex:100,background:"rgba(255,255,255,0.88)",borderRadius:8,padding:"6px 10px",border:"1px solid rgba(0,0,0,0.06)"}}>
        <div>H=Hand  V=Select+Move  P=Pen</div>
        <div>L=Line  A=Arrow  R=Rect</div>
        <div>E=Ellipse  T=Text  X=Eraser</div>
        <div>Ctrl+Z/Y=Undo/Redo  Del=Delete</div>
        <div>Select → drag corner = resize</div>
      </div>
    </div>
  );
}