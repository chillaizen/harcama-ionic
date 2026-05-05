// TBP4001-Ionic-Harcama-Projesi-2026

import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

const STORAGE_KEY = 'tbp4001_harcamalar';

export interface Harcama {
  id: string;
  ad: string;
  tutar: number;
  kategori: string;
  tarih: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  yeniAd = '';
  yeniTutar: number | null = null;
  yeniKategori = '';

  harcamalar: Harcama[] = [];

  kategoriler = [
    { ad: 'Yemek', renk: '#e57373' },
    { ad: 'Ulaşım', renk: '#64b5f6' },
    { ad: 'Eğlence', renk: '#ba68c8' },
    { ad: 'Diğer', renk: '#90a4ae' },
  ];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.yukle();
  }

  yukle() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.harcamalar = JSON.parse(raw);
      }
    } catch {
      this.harcamalar = [];
    }
  }

  kaydet() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.harcamalar));
  }

  kategoriRengi(ad: string): string {
    const k = this.kategoriler.find((x) => x.ad === ad);
    return k ? k.renk : '#bdbdbd';
  }

  get toplam(): number {
    return this.harcamalar.reduce((s, h) => s + h.tutar, 0);
  }

  async ekle() {
    const ad = this.yeniAd.trim();
    // ion-input bazen string döndürür; virgül/nokta ve eksi kontrolü
    const tutarStr = String(this.yeniTutar ?? '').trim().replace(',', '.');
    const tutar = parseFloat(tutarStr);

    if (!ad) {
      await this.toast('Harcama adı boş olamaz', 'warning');
      return;
    }
    if (!tutarStr || !isFinite(tutar) || tutar <= 0) {
      await this.toast('0’dan büyük pozitif bir tutar girin', 'warning');
      return;
    }
    if (!this.yeniKategori) {
      await this.toast('Kategori seçin', 'warning');
      return;
    }

    const yeni: Harcama = {
      id: Date.now().toString(),
      ad,
      tutar,
      kategori: this.yeniKategori,
      tarih: new Date().toISOString(),
    };

    this.harcamalar.unshift(yeni);
    this.kaydet();

    this.yeniAd = '';
    this.yeniTutar = null;
    this.yeniKategori = '';

    await this.toast('Harcama eklendi', 'success');
  }

  async silOnay(h: Harcama) {
    const alert = await this.alertController.create({
      header: 'Silinsin mi?',
      message: `"${h.ad}" kaydı silinecek.`,
      buttons: [
        { text: 'Vazgeç', role: 'cancel' },
        {
          text: 'Sil',
          role: 'destructive',
          handler: () => {
            this.sil(h);
          },
        },
      ],
    });
    await alert.present();
  }

  sil(h: Harcama) {
    this.harcamalar = this.harcamalar.filter((x) => x.id !== h.id);
    this.kaydet();
    void this.toast('Silindi', 'medium');
  }

  tarihMetni(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private async toast(mesaj: string, renk: 'success' | 'warning' | 'medium') {
    const t = await this.toastController.create({
      message: mesaj,
      duration: 1500,
      position: 'bottom',
      color: renk,
    });
    await t.present();
  }
}
