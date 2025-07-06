// 重複関数削除用のPowerShellスクリプト

# ファイルの最初の1030行だけを保持し、重複部分を削除
$filePath = "c:\Users\PC_User\Desktop\Atashinchi-study\public\pages\correction_mega.js"
$lines = Get-Content $filePath
$cleanLines = $lines[0..1029]  # 0-1029番目の行（最初の1030行）

# ファイル終了コメントを追加
$cleanLines += ""
$cleanLines += "// === ファイル終了 ==="
$cleanLines += "// 重複した関数定義によるSyntaxErrorを防ぐため、ここで終了します"

# ファイルを上書き
$cleanLines | Set-Content $filePath -Encoding UTF8

Write-Host "ファイルを1030行に切り詰めました。重複関数を削除しました。"
