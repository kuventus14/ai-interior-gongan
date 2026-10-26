import argparse,http.server,os
p=argparse.ArgumentParser();p.add_argument('--host',default='127.0.0.1');p.add_argument('--port',type=int,default=5173);p.add_argument('--strictPort',action='store_true');a=p.parse_args()
os.chdir(os.path.join(os.path.dirname(__file__),'public'))
http.server.ThreadingHTTPServer((a.host,a.port),http.server.SimpleHTTPRequestHandler).serve_forever()
