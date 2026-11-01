"""Atualiza a vitrine pública após autorização da conta institucional.
Credenciais apenas via GitHub Secrets. Não usar tokens no código."""
import os,json,urllib.parse,urllib.request,pathlib,sys
uid=os.environ.get('IG_USER_ID')
token=os.environ.get('IG_ACCESS_TOKEN')
if not (uid and token):
    print('Instagram não conectado. Nenhuma alteração no feed.')
    sys.exit(0)
fields='id,caption,media_type,media_url,thumbnail_url,permalink,timestamp'
url='https://graph.facebook.com/v24.0/'+urllib.parse.quote(uid,safe='')+'/media?'+urllib.parse.urlencode({'fields':fields,'limit':12,'access_token':token})
with urllib.request.urlopen(url,timeout=25) as resp:
    data=json.load(resp)
rows=[]
for p in data.get('data',[]):
    image = p.get('thumbnail_url') if p.get('media_type')=='VIDEO' else p.get('media_url')
    if p.get('permalink','').startswith('https://www.instagram.com/') and (image or '').startswith('https://'):
        rows.append({'id':p.get('id'),'caption':p.get('caption',''), 'image':image, 'permalink':p['permalink'],'date':p.get('timestamp','')})
if rows:
    target=pathlib.Path('assets/instagram-feed.json')
    target.write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('Atualizadas',len(rows),'publicações do perfil autorizado.')
else:
    print('API sem publicações acessíveis. Feed não alterado.')
