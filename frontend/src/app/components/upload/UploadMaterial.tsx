import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, Image, X, Plus, Download, Scissors,
  Merge, RotateCw, Trash2, Eye, ChevronLeft, ChevronRight,
  SplitSquareHorizontal, Crop, Contrast, Sun, FlipHorizontal,
  FlipVertical, Layers, AlertCircle, CheckCircle2, File,
  ArrowUpDown, MoveUp, MoveDown, RefreshCw, Pencil, Library,
  FolderOpen, Clock, Search, Filter, Star, StarOff, MoreVertical,
  BookOpen, CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

/* ─────────── types ─────────── */
type FileKind   = "pdf" | "image";
type ActiveTool = "merge"|"split"|"compress"|"rotate"|"crop"|"brightness"|"preview"|"reorder"|null;
type MainTab    = "workspace"|"library";

interface UploadedFile {
  id: string;
  name: string;
  kind: FileKind;
  size: number;
  url: string;
  pages?: number;
  order: number;
}

interface LibraryFile {
  id: string;
  name: string;
  kind: FileKind;
  size: number;
  url: string;
  pages?: number;
  action: string;       // what was done — "Merged", "Split", "Compressed", etc.
  savedAt: Date;
  starred: boolean;
  tags: string[];
}

const MAX_MB = 20;
const fmtSize = (b: number) => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
const uid = () => Math.random().toString(36).slice(2,9);

const mockPages = Array.from({ length: 8 }, (_, i) => ({ id: uid(), label: `Page ${i+1}` }));

const pdfTools = [
  { key:"merge",   icon:<Merge size={20}/>,                label:"Merge PDFs",    desc:"Combine multiple PDFs",           color:"from-indigo-500 to-violet-500" },
  { key:"split",   icon:<SplitSquareHorizontal size={20}/>, label:"Split PDF",     desc:"Extract page range",              color:"from-blue-500 to-cyan-500"     },
  { key:"compress",icon:<Layers size={20}/>,               label:"Compress",      desc:"Reduce file size",                color:"from-green-500 to-teal-500"    },
  { key:"reorder", icon:<ArrowUpDown size={20}/>,          label:"Reorder Pages", desc:"Rearrange page order",            color:"from-amber-500 to-orange-500"  },
  { key:"rotate",  icon:<RotateCw size={20}/>,             label:"Rotate Pages",  desc:"Rotate 90°/180°/270°",           color:"from-rose-500 to-pink-500"     },
  { key:"preview", icon:<Eye size={20}/>,                  label:"Preview",       desc:"Full-screen document view",      color:"from-purple-500 to-fuchsia-500"},
];
const imageTools = [
  { key:"crop",      icon:<Crop size={20}/>,      label:"Crop",         desc:"Crop to any ratio",              color:"from-indigo-500 to-violet-500" },
  { key:"rotate",    icon:<RotateCw size={20}/>,   label:"Rotate & Flip",desc:"Rotate / flip",                 color:"from-blue-500 to-cyan-500"     },
  { key:"brightness",icon:<Sun size={20}/>,        label:"Adjust",       desc:"Brightness, contrast, saturation",color:"from-amber-500 to-orange-500" },
  { key:"compress",  icon:<Layers size={20}/>,     label:"Compress",     desc:"Reduce image size",             color:"from-green-500 to-teal-500"    },
  { key:"merge",     icon:<Merge size={20}/>,      label:"Merge Images", desc:"Combine images",                color:"from-rose-500 to-pink-500"     },
  { key:"preview",   icon:<Eye size={20}/>,        label:"Preview",      desc:"Full-screen preview",           color:"from-purple-500 to-fuchsia-500"},
];

/* ─────────── Toast ─────────── */
function Toast({ msg, type }:{ msg:string; type:"success"|"error" }) {
  return (
    <motion.div initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl z-50 text-sm font-medium
        ${type==="success"?"bg-green-500 text-white":"bg-destructive text-white"}`}>
      {type==="success"?<CheckCircle2 size={18}/>:<AlertCircle size={18}/>}{msg}
    </motion.div>
  );
}

/* ─────────── Rename Modal ─────────── */
function RenameModal({ current, onSave, onClose }:{ current:string; onSave:(n:string)=>void; onClose:()=>void }) {
  const [val, setVal] = useState(current.replace(/\.[^.]+$/, ""));
  const ext = current.includes(".") ? current.slice(current.lastIndexOf(".")) : "";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <h3 className="font-bold text-lg mb-1">Rename File</h3>
        <p className="text-xs text-muted-foreground mb-4">Extension <span className="font-mono text-primary">{ext}</span> will be preserved</p>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key==="Enter" && onSave(val+ext)}
          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm mb-4" />
        <div className="flex gap-3">
          <button onClick={() => onSave(val+ext)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            Save Name
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-all text-sm">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────── Drop Zone ─────────── */
function DropZone({ onFiles }:{ onFiles:(files:File[])=>void }) {
  const [over, setOver] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = useCallback((fs:FileList|null) => { if(fs) onFiles(Array.from(fs)); }, [onFiles]);
  return (
    <div onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)}
      onDrop={e=>{e.preventDefault();setOver(false);handle(e.dataTransfer.files)}}
      onClick={()=>ref.current?.click()}
      className={`cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center text-center
        ${over?"border-primary bg-primary/10 scale-[1.01]":"border-border hover:border-primary/60 hover:bg-muted/40"}`}>
      <input ref={ref} type="file" className="hidden" multiple accept=".pdf,image/*"
        onChange={e=>handle(e.target.files)} />
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all ${over?"bg-primary text-primary-foreground scale-110":"bg-muted text-muted-foreground"}`}>
        <Upload size={36}/>
      </div>
      <p className="text-xl font-bold mb-2">{over?"Drop files here!":"Upload Files"}</p>
      <p className="text-muted-foreground text-sm mb-1">Drag & drop PDFs or images, or click to browse</p>
      <p className="text-muted-foreground/60 text-xs">PDF, PNG, JPG, WEBP, SVG · Max {MAX_MB} MB per file</p>
      <div className="flex gap-4 mt-6">
        {[{icon:<FileText size={16}/>,label:"PDFs"},{icon:<Image size={16}/>,label:"Images"}].map(t=>(
          <div key={t.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            {t.icon}{t.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────── File Card ─────────── */
function FileCard({ file, selected, onSelect, onRemove, onRename }:{
  file:UploadedFile; selected:boolean; onSelect:()=>void; onRemove:()=>void; onRename:()=>void;
}) {
  return (
    <motion.div layout initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
      onClick={onSelect}
      className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group
        ${selected?"border-primary shadow-lg shadow-primary/20":"border-border hover:border-primary/40 hover:shadow-md"}`}>
      <div className="h-28 bg-muted/50 flex items-center justify-center relative">
        {file.kind==="image"
          ? <img src={file.url} alt={file.name} className="w-full h-full object-cover"/>
          : <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <FileText size={36} className="text-red-400"/>
              {file.pages&&<span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">{file.pages}pp</span>}
            </div>
        }
        {selected&&<div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><CheckCheck size={28} className="text-primary"/></div>}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold truncate">{file.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${file.kind==="pdf"?"bg-red-500/10 text-red-500":"bg-blue-500/10 text-blue-500"}`}>
            {file.kind.toUpperCase()}
          </span>
          <span className="text-[10px] text-muted-foreground">{fmtSize(file.size)}</span>
        </div>
      </div>
      {/* action buttons */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e=>{e.stopPropagation();onRename();}}
          className="w-6 h-6 rounded-lg bg-background/90 backdrop-blur flex items-center justify-center shadow hover:bg-primary hover:text-primary-foreground transition-colors">
          <Pencil size={11}/>
        </button>
        <button onClick={e=>{e.stopPropagation();onRemove();}}
          className="w-6 h-6 rounded-lg bg-background/90 backdrop-blur flex items-center justify-center shadow hover:bg-destructive hover:text-destructive-foreground transition-colors">
          <X size={11}/>
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────── Library File Row ─────────── */
function LibraryRow({ file, onDownload, onRename, onStar, onDelete, onPreview }:{
  file:LibraryFile;
  onDownload:()=>void; onRename:()=>void; onStar:()=>void; onDelete:()=>void; onPreview:()=>void;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <motion.div layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all group">
      {/* icon */}
      <div onClick={onPreview} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer
        bg-gradient-to-br from-muted to-muted/50 hover:scale-105 transition-transform">
        {file.kind==="image"
          ? <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-xl"/>
          : <FileText size={24} className="text-red-400"/>
        }
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate">{file.name}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0
            ${file.kind==="pdf"?"bg-red-500/10 text-red-500":"bg-blue-500/10 text-blue-500"}`}>
            {file.kind.toUpperCase()}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium flex-shrink-0">
            {file.action}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{fmtSize(file.size)}</span>
          {file.pages && <span>{file.pages} pages</span>}
          <span className="flex items-center gap-1"><Clock size={10}/>{fmtDate(file.savedAt)}</span>
        </div>
        {file.tags.length>0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {file.tags.map(t=>(
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onStar} className={`p-2 rounded-xl transition-all hover:bg-muted ${file.starred?"text-amber-400":"text-muted-foreground"}`}>
          {file.starred?<Star size={16} className="fill-amber-400"/>:<StarOff size={16}/>}
        </button>
        <button onClick={onPreview}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-muted transition-all" title="Preview">
          <Eye size={16}/>
        </button>
        <button onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
          <Download size={14}/> Download
        </button>
        <div className="relative">
          <button onClick={()=>setMenu(v=>!v)}
            className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all">
            <MoreVertical size={16}/>
          </button>
          {menu&&(
            <div className="absolute right-0 top-9 z-30 bg-card border border-border rounded-xl shadow-xl w-36 py-1 text-sm">
              <button onClick={()=>{onRename();setMenu(false);}}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left">
                <Pencil size={13}/> Rename
              </button>
              <button onClick={()=>{onDelete();setMenu(false);}}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted w-full text-left text-destructive">
                <Trash2 size={13}/> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────── Preview Modal ─────────── */
function PreviewModal({ file, onClose }:{ file:LibraryFile|UploadedFile; onClose:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{opacity:0,scale:0.94}} animate={{opacity:1,scale:1}}
        className="w-full max-w-3xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-red-400"/>
            <p className="font-semibold text-sm truncate max-w-xs">{file.name}</p>
            <span className="text-xs text-muted-foreground">{fmtSize(file.size)}</span>
          </div>
          <div className="flex gap-2">
            <a href={file.url} download={file.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all">
              <Download size={13}/> Download
            </a>
            <button onClick={onClose} className="p-1.5 rounded-xl bg-muted hover:bg-muted/80 transition-all">
              <X size={16}/>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20 p-6 min-h-64">
          {(file as UploadedFile).kind==="image"
            ? <img src={file.url} alt={file.name} className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-lg"/>
            : <div className="flex flex-col items-center gap-4 text-muted-foreground py-12">
                <FileText size={72} className="text-red-400"/>
                <div className="text-center">
                  <p className="font-bold text-lg text-foreground">{file.name}</p>
                  <p className="text-sm mt-1">{(file as any).pages} pages · {fmtSize(file.size)}</p>
                  <p className="text-xs mt-3 opacity-60">Open in PDF viewer after download for full preview</p>
                </div>
                <a href={file.url} download={file.name}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all mt-2">
                  <Download size={18}/> Download PDF
                </a>
              </div>
          }
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────── Tool Panel ─────────── */
function ToolPanel({ tool, files, selectedIds, onClose, onComplete }:{
  tool:ActiveTool; files:UploadedFile[]; selectedIds:string[];
  onClose:()=>void; onComplete:(name:string, action:string, url:string, size:number, pages?:number)=>void;
}) {
  const [splitFrom, setSplitFrom] = useState(1);
  const [splitTo, setSplitTo]     = useState(3);
  const [rotation, setRotation]   = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast]   = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [quality, setQuality]     = useState(80);
  const [pages, setPages]         = useState(mockPages);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [outputName, setOutputName] = useState("");
  const [renaming, setRenaming]   = useState(false);

  const active = files.filter(f=>selectedIds.includes(f.id));
  const primary = active[0] ?? files[0];
  const previewFile = active[previewIdx] ?? files[0];

  const defaultName = (suffix:string) =>
    outputName || `${primary?.name?.replace(/\.[^.]+$/,"")??"output"}_${suffix}.${primary?.kind==="image"?"png":"pdf"}`;

  const finish = (action:string, nameSuffix:string) => {
    const name = defaultName(nameSuffix);
    onComplete(name, action, primary?.url??"", primary?.size??100000, primary?.pages);
  };

  if(!tool) return null;

  return (
    <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:40}}
      className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold capitalize">{tool.replace("-"," ")}</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center"><X size={14}/></button>
      </div>

      {/* output name field — always visible */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Output File Name</label>
        <div className="flex gap-2">
          <input value={outputName} onChange={e=>setOutputName(e.target.value)}
            placeholder={defaultName(tool)}
            className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"/>
        </div>
      </div>

      {/* MERGE */}
      {tool==="merge"&&(
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Files to merge (in order):</p>
          {(active.length>0?active:files).map((f,i)=>(
            <div key={f.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/50 border border-border">
              <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span>
              {f.kind==="pdf"?<FileText size={15} className="text-red-400 flex-shrink-0"/>:<Image size={15} className="text-blue-400 flex-shrink-0"/>}
              <span className="text-xs flex-1 truncate">{f.name}</span>
              <span className="text-[10px] text-muted-foreground">{fmtSize(f.size)}</span>
            </div>
          ))}
          <button onClick={()=>finish("Merged","merged")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <Merge size={16}/> Merge & Save to Library
          </button>
        </div>
      )}

      {/* SPLIT */}
      {tool==="split"&&(
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From Page</label>
              <input type="number" min={1} max={50} value={splitFrom} onChange={e=>setSplitFrom(+e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To Page</label>
              <input type="number" min={1} max={50} value={splitTo} onChange={e=>setSplitTo(+e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
            Extracting pages {splitFrom}–{splitTo} ({Math.max(0,splitTo-splitFrom+1)} pages)
          </div>
          <button onClick={()=>finish("Split","split")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <Scissors size={16}/> Split & Save to Library
          </button>
        </div>
      )}

      {/* COMPRESS */}
      {tool==="compress"&&(
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Quality</label>
              <span className="text-xs font-bold text-primary">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} step={5} value={quality} onChange={e=>setQuality(+e.target.value)} className="w-full accent-indigo-500"/>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5"><span>Smaller file</span><span>Better quality</span></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[{q:40,l:"High Compress"},{q:70,l:"Balanced"},{q:95,l:"High Quality"}].map(p=>(
              <button key={p.q} onClick={()=>setQuality(p.q)}
                className={`py-2 rounded-xl text-xs font-medium border transition-all ${quality===p.q?"bg-primary text-primary-foreground border-primary":"border-border bg-muted/50 hover:bg-muted"}`}>
                {p.l}
              </button>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-500">
            ~{Math.round((primary?.size??1000000)*(quality/100)/1024)} KB estimated output
          </div>
          <button onClick={()=>finish("Compressed","compressed")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <Download size={16}/> Compress & Save to Library
          </button>
        </div>
      )}

      {/* ROTATE */}
      {tool==="rotate"&&(
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[0,90,180,270].map(deg=>(
              <button key={deg} onClick={()=>setRotation(deg)}
                className={`py-2.5 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition-all
                  ${rotation===deg?"bg-primary text-primary-foreground border-primary":"border-border bg-muted/50 hover:bg-muted"}`}>
                <RotateCw size={16} style={{transform:`rotate(${deg}deg)`}}/>{deg}°
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs flex items-center justify-center gap-1.5 transition-all"><FlipHorizontal size={14}/>Flip H</button>
            <button className="flex-1 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs flex items-center justify-center gap-1.5 transition-all"><FlipVertical size={14}/>Flip V</button>
          </div>
          {primary?.kind==="image"&&(
            <div className="rounded-xl overflow-hidden border border-border h-36 flex items-center justify-center bg-muted/30">
              <img src={primary.url} alt="preview" className="max-h-full max-w-full object-contain transition-all duration-300" style={{transform:`rotate(${rotation}deg)`}}/>
            </div>
          )}
          <button onClick={()=>finish("Rotated","rotated")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <RotateCw size={16}/> Apply & Save to Library
          </button>
        </div>
      )}

      {/* BRIGHTNESS */}
      {tool==="brightness"&&(
        <div className="space-y-4">
          {[{label:"Brightness",val:brightness,set:setBrightness},{label:"Contrast",val:contrast,set:setContrast},{label:"Saturation",val:saturation,set:setSaturation}].map(sl=>(
            <div key={sl.label}>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">{sl.label}</label>
                <span className="text-xs font-bold text-primary">{sl.val}%</span>
              </div>
              <input type="range" min={0} max={200} step={5} value={sl.val} onChange={e=>sl.set(+e.target.value)} className="w-full accent-indigo-500"/>
            </div>
          ))}
          {primary?.kind==="image"&&(
            <div className="rounded-xl overflow-hidden border border-border h-32 flex items-center justify-center bg-muted/30">
              <img src={primary.url} alt="preview" className="max-h-full max-w-full object-contain"
                style={{filter:`brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`}}/>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={()=>{setBrightness(100);setContrast(100);setSaturation(100);}}
              className="flex-1 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs flex items-center justify-center gap-1.5"><RefreshCw size={13}/>Reset</button>
            <button onClick={()=>finish("Adjusted","adjusted")}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 text-xs flex items-center justify-center gap-1.5"><Download size={13}/>Save to Library</button>
          </div>
        </div>
      )}

      {/* REORDER */}
      {tool==="reorder"&&(
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Click ↑ / ↓ to reorder pages.</p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {pages.map((p,i)=>(
              <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/50 border border-border">
                <span className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                <FileText size={13} className="text-muted-foreground flex-shrink-0"/>
                <span className="text-xs flex-1">{p.label}</span>
                <div className="flex gap-0.5">
                  <button disabled={i===0} onClick={()=>setPages(prev=>{const a=[...prev];[a[i-1],a[i]]=[a[i],a[i-1]];return a;})}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"><MoveUp size={13}/></button>
                  <button disabled={i===pages.length-1} onClick={()=>setPages(prev=>{const a=[...prev];[a[i],a[i+1]]=[a[i+1],a[i]];return a;})}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30"><MoveDown size={13}/></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>finish("Reordered","reordered")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <Download size={16}/> Save Order to Library
          </button>
        </div>
      )}

      {/* CROP */}
      {tool==="crop"&&(
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[["Free","✂️"],["1:1","◼"],["16:9","▬"],["4:3","▭"],["3:2","▭"],["Custom","⚙️"]].map(([l,ic])=>(
              <button key={l} className="py-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted hover:border-primary/40 text-xs font-medium flex flex-col items-center gap-0.5 transition-all">
                <span className="text-base">{ic}</span>{l}
              </button>
            ))}
          </div>
          {primary?.kind==="image"&&(
            <div className="rounded-xl overflow-hidden border-2 border-dashed border-primary/40 h-40 flex items-center justify-center bg-muted/30 relative">
              <img src={primary.url} alt="crop" className="max-h-full max-w-full object-contain opacity-80"/>
              <div className="absolute inset-5 border-2 border-primary rounded-lg"/>
            </div>
          )}
          <button onClick={()=>finish("Cropped","cropped")}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm">
            <Crop size={16}/> Crop & Save to Library
          </button>
        </div>
      )}

      {/* PREVIEW */}
      {tool==="preview"&&(
        <div className="space-y-3">
          {active.length>1&&(
            <div className="flex items-center justify-between">
              <button onClick={()=>setPreviewIdx(i=>Math.max(0,i-1))} disabled={previewIdx===0} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30"><ChevronLeft size={16}/></button>
              <span className="text-xs text-muted-foreground">{previewIdx+1}/{active.length}</span>
              <button onClick={()=>setPreviewIdx(i=>Math.min(active.length-1,i+1))} disabled={previewIdx===active.length-1} className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30"><ChevronRight size={16}/></button>
            </div>
          )}
          {previewFile&&(
            <div className="rounded-2xl overflow-hidden border border-border bg-muted/20 flex items-center justify-center min-h-48">
              {previewFile.kind==="image"
                ?<img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-64 object-contain"/>
                :<div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
                  <FileText size={48} className="text-red-400"/>
                  <p className="font-semibold text-sm">{previewFile.name}</p>
                  <p className="text-xs">{previewFile.pages} pages · {fmtSize(previewFile.size)}</p>
                </div>
              }
            </div>
          )}
          <a href={previewFile?.url} download={previewFile?.name}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all text-sm">
            <Download size={16}/> Download Original
          </a>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────── MAIN ─────────── */
export default function UploadMaterial() {
  const [files, setFiles]         = useState<UploadedFile[]>([]);
  const [library, setLibrary]     = useState<LibraryFile[]>([]);
  const [selectedIds, setSelected] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [mainTab, setMainTab]     = useState<MainTab>("workspace");
  const [fileTab, setFileTab]     = useState<"all"|"pdf"|"image">("all");
  const [libFilter, setLibFilter] = useState<"all"|"pdf"|"image"|"starred">("all");
  const [libSearch, setLibSearch] = useState("");
  const [toast, setToast]         = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [renameTarget, setRenameTarget] = useState<{id:string;name:string;scope:"workspace"|"library"}|null>(null);
  const [previewFile, setPreviewFile] = useState<LibraryFile|UploadedFile|null>(null);

  const showToast = (msg:string, type:"success"|"error"="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  /* upload */
  const addFiles = (raw:File[]) => {
    const valid:UploadedFile[] = [];
    raw.forEach(f => {
      if(f.size>MAX_MB*1048576){ showToast(`"${f.name}" exceeds ${MAX_MB}MB`,"error"); return; }
      const kind:FileKind = f.type==="application/pdf"?"pdf":"image";
      valid.push({ id:uid(), name:f.name, kind, size:f.size, url:URL.createObjectURL(f),
        pages:kind==="pdf"?Math.floor(Math.random()*20)+2:undefined, order:files.length+valid.length });
    });
    if(valid.length){ setFiles(p=>[...p,...valid]); showToast(`${valid.length} file(s) added`); }
  };

  /* tool completion → save to library */
  const handleToolComplete = (name:string, action:string, url:string, size:number, pages?:number) => {
    const src = files.find(f=>selectedIds.includes(f.id))??files[0];
    const lib:LibraryFile = {
      id:uid(), name, kind:src?.kind??"pdf", size, url, pages,
      action, savedAt:new Date(), starred:false,
      tags:[action, src?.kind==="pdf"?"PDF":"Image"],
    };
    setLibrary(p=>[lib,...p]);
    setActiveTool(null);
    showToast(`"${name}" saved to Library ✓`);
    setMainTab("library");
  };

  /* rename */
  const applyRename = (newName:string) => {
    if(!renameTarget) return;
    if(renameTarget.scope==="workspace")
      setFiles(p=>p.map(f=>f.id===renameTarget.id?{...f,name:newName}:f));
    else
      setLibrary(p=>p.map(f=>f.id===renameTarget.id?{...f,name:newName}:f));
    setRenameTarget(null);
    showToast("File renamed");
  };

  const removeFile = (id:string) => { setFiles(p=>p.filter(f=>f.id!==id)); setSelected(p=>p.filter(i=>i!==id)); };
  const toggleSel  = (id:string) => setSelected(p=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);

  const displayed  = files.filter(f=>fileTab==="all"||f.kind===fileTab);
  const pdfCount   = files.filter(f=>f.kind==="pdf").length;
  const imgCount   = files.filter(f=>f.kind==="image").length;

  const libDisplayed = library
    .filter(f=>libFilter==="all"||(libFilter==="starred"?f.starred:f.kind===libFilter))
    .filter(f=>f.name.toLowerCase().includes(libSearch.toLowerCase()));

  const activeKind:FileKind|null = files.length ? (files.some(f=>f.kind==="pdf")?"pdf":"image") : null;
  const tools = activeKind==="image" ? imageTools : pdfTools;

  return (
    <div className="min-h-screen bg-background">
      {/* sticky header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
              <Upload size={17} className="text-white"/>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Upload Material</h1>
              <p className="text-xs text-muted-foreground">PDF & Image toolkit · {library.length} files in library</p>
            </div>
          </div>
          {/* main tab switcher */}
          <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
            <button onClick={()=>setMainTab("workspace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab==="workspace"?"bg-background shadow text-foreground":"text-muted-foreground"}`}>
              <Upload size={15}/> Workspace
            </button>
            <button onClick={()=>setMainTab("library")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mainTab==="library"?"bg-background shadow text-foreground":"text-muted-foreground"}`}>
              <Library size={15}/> Library
              {library.length>0&&<span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{library.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ══ WORKSPACE ══ */}
        {mainTab==="workspace"&&(
          <div className="space-y-6">
            <DropZone onFiles={addFiles}/>

            {files.length>0&&(
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* file list */}
                <div className="xl:col-span-2 space-y-4">
                  {/* tab + actions */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                      {([["all","All",files.length],["pdf","PDF",pdfCount],["image","Images",imgCount]] as const).map(([k,l,c])=>(
                        <button key={k} onClick={()=>setFileTab(k)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${fileTab===k?"bg-background shadow text-foreground":"text-muted-foreground"}`}>
                          {l} ({c})
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {selectedIds.length>0
                        ?<button onClick={()=>setSelected([])} className="px-3 py-1.5 rounded-xl text-xs border border-border hover:bg-muted transition-all">Clear ({selectedIds.length})</button>
                        :<button onClick={()=>setSelected(displayed.map(f=>f.id))} className="px-3 py-1.5 rounded-xl text-xs border border-border hover:bg-muted transition-all">Select All</button>
                      }
                      {selectedIds.length>0&&(
                        <button onClick={()=>{selectedIds.forEach(removeFile);setSelected([]);}}
                          className="px-3 py-1.5 rounded-xl text-xs border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all flex items-center gap-1">
                          <Trash2 size={12}/> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="popLayout">
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {displayed.map(f=>(
                        <FileCard key={f.id} file={f} selected={selectedIds.includes(f.id)}
                          onSelect={()=>toggleSel(f.id)} onRemove={()=>removeFile(f.id)}
                          onRename={()=>setRenameTarget({id:f.id,name:f.name,scope:"workspace"})}/>
                      ))}
                      <label className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[148px] text-muted-foreground hover:text-primary transition-all">
                        <Plus size={24}/><span className="text-xs font-medium">Add More</span>
                        <input type="file" multiple className="hidden" accept=".pdf,image/*"
                          onChange={e=>addFiles(Array.from(e.target.files??[]))}/>
                      </label>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* tools */}
                <div className="space-y-4">
                  {!activeTool&&(
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{activeKind==="image"?"Image Tools":"PDF Tools"}</p>
                        {selectedIds.length>0&&<span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {tools.map(t=>(
                          <button key={t.key} onClick={()=>setActiveTool(t.key as ActiveTool)}
                            className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group text-left">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>{t.icon}</div>
                            <div>
                              <p className="text-xs font-semibold">{t.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{t.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs text-indigo-400 font-semibold mb-1.5">💡 Tips</p>
                        <ul className="space-y-1 text-[11px] text-muted-foreground">
                          <li>• Select files first, then choose a tool</li>
                          <li>• Results are saved to your Library</li>
                          <li>• All processing is done in-browser</li>
                          <li>• You can rename files before downloading</li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                  <AnimatePresence>
                    {activeTool&&(
                      <ToolPanel key={activeTool} tool={activeTool} files={files}
                        selectedIds={selectedIds} onClose={()=>setActiveTool(null)}
                        onComplete={handleToolComplete}/>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* feature grid when empty */}
            {files.length===0&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1,transition:{delay:0.2}}}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
                {[
                  {icon:<Merge size={20}/>,label:"Merge",desc:"Combine files",color:"bg-indigo-500/10 text-indigo-400"},
                  {icon:<SplitSquareHorizontal size={20}/>,label:"Split",desc:"Extract pages",color:"bg-blue-500/10 text-blue-400"},
                  {icon:<Layers size={20}/>,label:"Compress",desc:"Reduce size",color:"bg-green-500/10 text-green-400"},
                  {icon:<RotateCw size={20}/>,label:"Rotate",desc:"Rotate & flip",color:"bg-amber-500/10 text-amber-400"},
                  {icon:<Crop size={20}/>,label:"Crop",desc:"Crop images",color:"bg-rose-500/10 text-rose-400"},
                  {icon:<Library size={20}/>,label:"Library",desc:"Your saved files",color:"bg-purple-500/10 text-purple-400"},
                ].map(f=>(
                  <div key={f.label} className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all text-center">
                    <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center`}>{f.icon}</div>
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* ══ LIBRARY ══ */}
        {mainTab==="library"&&(
          <div className="space-y-5">
            {/* library header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><Library size={20} className="text-primary"/> My Library</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Files saved after processing — ready to download</p>
              </div>
              <button onClick={()=>setMainTab("workspace")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
                <Upload size={15}/> Process New File
              </button>
            </div>

            {/* search + filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
                <input value={libSearch} onChange={e=>setLibSearch(e.target.value)} placeholder="Search files…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"/>
              </div>
              <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
                {([["all","All"],["pdf","PDF"],["image","Images"],["starred","Starred"]] as const).map(([k,l])=>(
                  <button key={k} onClick={()=>setLibFilter(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${libFilter===k?"bg-background shadow text-foreground":"text-muted-foreground"}`}>
                    {k==="starred"&&<Star size={11} className="text-amber-400"/>}{l}
                  </button>
                ))}
              </div>
            </div>

            {library.length===0
              ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}}
                  className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
                    <FolderOpen size={36} className="text-muted-foreground"/>
                  </div>
                  <h3 className="font-bold text-lg">Library is empty</h3>
                  <p className="text-muted-foreground text-sm mt-1 max-w-xs">Upload a file and apply a tool (merge, split, compress…) to save results here.</p>
                  <button onClick={()=>setMainTab("workspace")}
                    className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
                    <Upload size={17}/> Upload Your First File
                  </button>
                </motion.div>
              )
              : libDisplayed.length===0
              ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Search size={40} className="mx-auto mb-3 opacity-30"/>
                  <p>No files match your search or filter.</p>
                </div>
              )
              : (
                <AnimatePresence>
                  <div className="space-y-3">
                    {libDisplayed.map(f=>(
                      <LibraryRow key={f.id} file={f}
                        onDownload={()=>{ const a=document.createElement("a"); a.href=f.url; a.download=f.name; a.click(); showToast(`Downloading "${f.name}"`); }}
                        onRename={()=>setRenameTarget({id:f.id,name:f.name,scope:"library"})}
                        onStar={()=>setLibrary(p=>p.map(x=>x.id===f.id?{...x,starred:!x.starred}:x))}
                        onDelete={()=>{ setLibrary(p=>p.filter(x=>x.id!==f.id)); showToast("File removed from library"); }}
                        onPreview={()=>setPreviewFile(f)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )
            }

            {/* library stats */}
            {library.length>0&&(
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  {label:"Total Files",  val:library.length,              icon:<BookOpen size={16}/>, color:"text-indigo-400"},
                  {label:"PDFs",         val:library.filter(f=>f.kind==="pdf").length,   icon:<FileText size={16}/>, color:"text-red-400"},
                  {label:"Images",       val:library.filter(f=>f.kind==="image").length, icon:<Image size={16}/>,    color:"text-blue-400"},
                  {label:"Starred",      val:library.filter(f=>f.starred).length,        icon:<Star size={16}/>,     color:"text-amber-400"},
                ].map(s=>(
                  <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card">
                    <div className={`${s.color}`}>{s.icon}</div>
                    <div>
                      <p className="text-xl font-bold">{s.val}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* rename modal */}
      <AnimatePresence>
        {renameTarget&&<RenameModal current={renameTarget.name} onSave={applyRename} onClose={()=>setRenameTarget(null)}/>}
      </AnimatePresence>

      {/* preview modal */}
      <AnimatePresence>
        {previewFile&&<PreviewModal file={previewFile} onClose={()=>setPreviewFile(null)}/>}
      </AnimatePresence>

      {/* toast */}
      <AnimatePresence>
        {toast&&<Toast msg={toast.msg} type={toast.type}/>}
      </AnimatePresence>
    </div>
  );
}
