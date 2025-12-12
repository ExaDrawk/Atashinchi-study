# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Users\PC_User\Documents\予備試験\行政法\一問一答行政法\1.1-86.txt'
output_path = r'C:\Users\PC_User\Desktop\Atashinchi-study\scripts\test_gyousei.txt'

# 複数のエンコーディングを試す
encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'utf-16-le', 'utf-16-be', 'cp932', 'shift_jis', 'euc_jp']

for enc in encodings:
    try:
        with open(file_path, 'r', encoding=enc) as f:
            content = f.read()
        print(f'{enc}: SUCCESS')
        # 最初の500文字を出力
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(f'=== Encoding: {enc} ===\n')
            out.write(content[:3000])
        break
    except Exception as e:
        print(f'{enc}: {e}')
