import base64,os,re
D=os.path.dirname(os.path.abspath(__file__));F='/workspace/gemara-test-6-11/fonts'
faces=[('Assistant','Assistant-SemiBold.ttf',600),('Assistant','Assistant-Bold.ttf',700),('Assistant','Assistant-ExtraBold.ttf',800),('Frank Ruhl Libre','FrankRuhlLibre-Bold.ttf',700),('Frank Ruhl Libre','FrankRuhlLibre-ExtraBold.ttf',800)]
ff=''.join('@font-face{font-family:"%s";font-weight:%d;font-display:swap;src:url(data:font/ttf;base64,%s) format("truetype")}\n'%(n,w,base64.b64encode(open(os.path.join(F,f),'rb').read()).decode()) for n,f,w in faces)
r=lambda f:open(os.path.join(D,'src',f),encoding='utf-8').read()
html='''<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>לומדה · סוגיות ו–יא · תפילין (מנחות לו ע״ב – לז ע״א)</title><style>%s%s</style></head><body>
<header class="topbar" id="topbar" hidden><button class="menu-btn" id="menuBtn" aria-label="תפריט">☰</button><div class="brand"><span class="brand-mark">ת</span><span class="brand-text">לומדה · סוגיות ו–יא</span></div><div class="prog"><div class="prog-bar"><div class="prog-fill" id="progFill"></div></div><span id="progText">0%%</span></div><span class="pts">⭐ <span id="points">0</span></span><span class="who" id="whoName"></span></header>
<div class="layout"><nav class="side" id="side" hidden></nav><main id="view"></main></div><div class="scrim" id="scrim" hidden></div><div class="toast" id="toast"></div><div class="gpop" id="gpop" hidden></div>
<script>%s</script><script>%s</script><script>%s</script></body></html>'''%(ff,r('style.css'),r('content.js'),r('gloss.js'),r('app.js'))
assert not re.search(r'(src|href)=["\']?https?:',html)
out=os.path.join(D,'לומדה סוגיות ו-יא.html');open(out,'w',encoding='utf-8').write(html);print(out,len(html)//1024,'KB')
