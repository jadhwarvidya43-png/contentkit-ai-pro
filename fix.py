import os
pages = [
  'apps/client/src/app/page.tsx',
  'apps/client/src/app/(public)/login/page.tsx',
  'apps/client/src/app/(public)/register/page.tsx',
  'apps/client/src/app/(public)/profile/page.tsx',
  'apps/client/src/app/not-found.tsx'
]
for p in pages:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace('\"use client\";\\
import', '\"use client\";\nimport')
        c = c.replace('\"use client\";\
import', '\"use client\";\nimport')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)
