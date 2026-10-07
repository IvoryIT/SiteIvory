# Mostra a árvore do Elementor de uma ou mais páginas (resumo legível).
# Uso: python -I scripts/migracao/arvore.py .tmp/elementor_data.tsv <id>[,<id>...]
import sys; sys.stdout.reconfigure(encoding="utf-8")
import sys, json, re
path=sys.argv[1]; ids=set(sys.argv[2].split(','))
KEYS=('content_width','width','flex_direction','background_background','background_color','background_image','padding','margin','min_height','css_classes','_css_classes','_element_id','typography_font_size','title_color','text_color','align','header_size','link','image','template_id','size','button_text_color','background_overlay_background','flex_gap','boxed_width','border_radius','_position')
def short(v):
    if isinstance(v,dict):
        if 'url' in v: return 'url:'+str(v.get('url'))[-60:]
        if 'unit' in v: return f"{v.get('top',v.get('size',''))}/{v.get('right','')}/{v.get('bottom','')}/{v.get('left','')}{v.get('unit')}" if 'top' in v else f"{v.get('size')}{v.get('unit')}"
        if 'id' in v: return f"id:{v['id']}"
    return str(v)[:50]
def txt(h): 
    t=re.sub(r'<[^>]+>',' ',h or ''); t=re.sub(r'\s+',' ',t).strip(); return t[:90]
for line in open(path,encoding='utf-8'):
    pid,pt,st,data=line.rstrip('\n').split('\t',3)
    if pid not in ids: continue
    print('='*20,pid)
    def walk(ns,d=0):
        for n in ns:
            s=n.get('settings') or {}
            kv=' '.join(f"{k}={short(s[k])}" for k in KEYS if k in s and s[k] not in ('',None,[],{}))
            if n['elType']=='widget':
                w=n['widgetType']; extra=''
                if w=='text-editor': extra='"'+txt(s.get('editor'))+'"'
                if w=='heading': extra='"'+txt(s.get('title'))+'"'
                if w=='button': extra='"'+txt(s.get('text'))+'"'
                print('  '*d+f"- {w} {extra} {kv}"[:300])
            else:
                print('  '*d+f"[{n['elType']}] {kv}"[:300])
            walk(n.get('elements') or [],d+1)
    walk(json.loads(data))
