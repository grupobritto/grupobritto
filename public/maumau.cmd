@echo off
REM Detectar a edição do Windows e ativar com a chave correspondente

for /f "tokens=3 delims= " %%A in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v EditionID 2^>nul') do set "Edition=%%A"

REM Mapear chaves conforme a edição
if /i "%Edition%"=="Professional" (
    set "KEY=W269N-WFGWX-YVC9B-4J6C9-T83GX"
) else if /i "%Edition%"=="ProfessionalN" (
    set "KEY=MH37W-N47XK-V7XM9-C7227-GCQG9"
) else if /i "%Edition%"=="Home" (
    set "KEY=TX9XD-98N7V-6WMQ6-BX7FG-H8Q99"
) else if /i "%Edition%"=="HomeN" (
    set "KEY=3KHY7-WNT83-DGQKR-F7HPR-844BM"
) else if /i "%Edition%"=="HomeSingleLanguage" (
    set "KEY=7HNRX-D7KGG-3K4RQ-4WPJ4-YTDFH"
) else if /i "%Edition%"=="HomeCountrySpecific" (
    set "KEY=PVMJN-6DFY6-9CCP6-7BKTT-D3WVR"
) else if /i "%Edition%"=="Education" (
    set "KEY=NW6C2-QMPVW-D7KKK-3GKT6-VCFB2"
) else if /i "%Edition%"=="EducationN" (
    set "KEY=2WH4N-8QGBV-H22JP-CT43Q-MDWWJ"
) else if /i "%Edition%"=="Enterprise" (
    set "KEY=NPPR9-FWDCX-D2C8J-H872K-2YT43"
) else if /i "%Edition%"=="EnterpriseN" (
    set "KEY=DPH2V-TTNVB-4X9Q3-TJR4H-KHJW4"
) else (
    echo Edicao do Windows nao reconhecida: %Edition%
    echo Ativacao abortada.
    exit /b 1
)

cscript slmgr.vbs /ipk %KEY%
cscript slmgr.vbs /skms kms8.msguides.com
cscript slmgr.vbs /ato

pause