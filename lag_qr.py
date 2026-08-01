# -*- coding: utf-8 -*-
"""
Lager QR-kode som peker til bryllupsportalen.
Kjør:  python lag_qr.py
Bytt URL under hvis adressen endres.
"""
import qrcode
from qrcode.constants import ERROR_CORRECT_M

URL = "https://thpest.github.io/bryllup"
UT = "qr_bryllup.png"

# Bryllupsfarger: mørk navy på hvitt (god kontrast = lettest å skanne)
NAVY = (38, 66, 92)
HVIT = (255, 255, 255)

qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_M,  # tåler litt slitasje/print
    box_size=20,                        # stor => skarp utskrift
    border=4,                           # stillesone rundt (må være >=4)
)
qr.add_data(URL)
qr.make(fit=True)

img = qr.make_image(fill_color=NAVY, back_color=HVIT).convert("RGB")
img.save(UT)
print(f"Skrev {UT}  ({img.size[0]}x{img.size[1]} px)  ->  {URL}")
