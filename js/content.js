/* Nefes – rozet tanımları, seviyeler ve bilgi merkezi metinleri
   Mehmet Karadeniz, 2026-2027 */

/* ================= Rozetler, seviyeler ve bilgi merkezi içeriği ================= */
const CATS = [
  ['seri','🔥',_t('seri'),'#fb923c'], ['saglik','❤️',_t('saglik'),'#fb7185'], ['para','💰',_t('para'),'#fbbf24'], ['sigara','🚭',_t('sigara_2'),'#60a5fa'],
  ['kriz','🛡️',_t('krizler'),'#a78bfa'], ['nefes','🫁',_t('nefes'),'#2dd4bf'], ['oyun','🎮',_t('oyunlar'),'#38bdf8'], ['aliskanlik','🌱',_t('aliskanliklar'),'#b5f23d'], ['ozel','⭐',_t('ozel'),'#f472b6']
];
const B = (cat,id,e,n,d,t,v,fmt) => ({cat,id,e,n,d,t,v,fmt});
const HB = [['💓',_t('nabiz_dengede')],['🩸',_t('oksijen_yukseldi')],['🌬️',_t('karbonmonoksit_temizlendi')],['👅',_t('tatlar_geri_dondu')],['🫁',_t('rahat_nefes')],['🚶',_t('dolasim_guclendi')],
  ['📈',_t('guclu_akcigerler')],['🍃',_t('oksuruk_azaldi')],['❤️',_t('kalbe_bir_yil')],['🧠',_t('inme_riski_azaldi')],['🎗️',_t('on_yillik_zafer')],['🏅',_t('kalp_kadar_saglam')]];
const T = (id,days,e,n) => B('seri',id,e,n,(days<1?Math.round(days*24)+_t('u_saat'):days+_t('gun'))+_t('sigarasiz_2'),days*D,c=>c.el,'time');
const BADGES = [
  T('first',1,'🌱',_t('ilk_adim')), T('k2',2,'🌤️',_t('iki_gun')), T('k3',3,'💪',_t('kararlilik')), T('k7',7,'🔥',_t('guclu_irade')),
  T('k10',10,'🔟',_t('on_gun')), T('k14',14,'🌅',_t('yeni_baslangic')), T('k21',21,'🧱',_t('yeni_aliskanlik')), T('k30',30,'🕊️',_t('bir_ay_ozgurluk')),
  T('k60',60,'🌻',_t('iki_ay')), T('k90',90,'🏆',_t('buyuk_basari')), T('k120',120,'🍀',_t('dort_ay')), T('k180',180,'🌳',_t('yarim_yil')),
  T('k270',270,'🌈',_t('dokuz_ay')), T('k365',365,'👑',_t('ozgur_hayat')), T('k730',730,'🎖️',_t('iki_yil')), T('k1095',1095,'🏛️',_t('uc_yil')),
  ...MS.map(([t,txt],i)=>B('saglik','h'+i,HB[i][0],HB[i][1],label(t)+': '+txt,t,c=>c.el,'time')),
  ...[[100,'s100','🪙',_t('ilk_kuruslar')],[250,'s250','👛',_t('cep_harcligi')],[500,'s500','💴',_t('ilk_birikim')],[750,'s750','🧾',_t('fatura_parasi')],[1000,'s1k','💰',_t('kumbaraci')],
      [2500,'s2500','💵',_t('tasarrufcu')],[5000,'s5k','💳',_t('butce_ustasi')],[10000,'s10k','🏦',_t('servet_yolunda')],[25000,'s25k','💎',_t('buyuk_birikim')],
      [50000,'s50k','🏝️',_t('hayallerine_bir_adim')],[100000,'s100k','🏰',_t('yuz_bin')]]
     .map(([n,id,e,nm])=>B('para',id,e,nm,'₺'+n.toLocaleString(LOCALE)+_t('u_biriktir'),n,c=>c.savedT,'tl')),
  B('para','goal','🎯',_t('hedefe_ulastin'),_t('tasarruf_hedefini_tamamla'),1,c=>S.goal&&S.goal.amount?c.savedT/S.goal.amount:0,'pct'),
  ...[[50,'n50','🚬',_t('elli')],[100,'n100','🚭',_t('ilk_yuz')],[250,'n250','🧯',_t('ceyrek_bin')],[500,'n500','🌬️',_t('bes_yuz')],[1000,'n1000','🌿',_t('binlik')],[2500,'n2500','🌲',_t('dev_adim')],
      [5000,'n5000','🏔️',_t('bes_bin')],[10000,'n10000','🌍',_t('on_bin')],[20000,'n20000','🌌',_t('yirmi_bin')],[50000,'n50000','🪐',_t('elli_bin')]]
     .map(([n,id,e,nm])=>B('sigara',id,e,nm,n.toLocaleString(LOCALE)+_t('sigara_icme'),n,c=>c.cigsT,'n')),
  B('sigara','pk1','📦',_t('ilk_paket'),_t('bir_paket_icme'),1,c=>c.cigsT/S.pack,'n'),
  B('sigara','pk10','🗃️',_t('on_paket'),_t('n10_paket_icme'),10,c=>c.cigsT/S.pack,'n'),
  B('sigara','pk100','🏗️',_t('yuz_paket'),_t('n100_paket_icme'),100,c=>c.cigsT/S.pack,'n'),
  ...[[1,'c1','🛡️',_t('ilk_zafer')],[3,'c3','🪖',_t('uc_zafer')],[5,'c5','🥋',_t('savasci')],[10,'c10','⚔️',_t('kriz_ustasi')],[25,'c25','🏹',_t('saglam_irade')],
      [50,'c50','🧘',_t('sukunet')],[100,'c100','🗿',_t('sarsilmaz')],[250,'c250','🐉',_t('efsane')]]
     .map(([n,id,e,nm])=>B('kriz',id,e,nm,n===1?_t('ilk_krizi_atlat'):n+_t('krizi_atlat'),n,c=>c.passed,'n')),
  B('kriz','night','🌃',_t('gece_bekcisi'),_t('gece_22_00_06_00'),3,c=>c.nightPassed,'n'),
  B('kriz','trig3','🔍',_t('kendini_tani'),_t('n3_farkli_tetikleyiciyi_kaydet'),3,c=>c.trigKinds,'n'),
  B('kriz','trig6','🗺️',_t('tetikleyici_haritasi'),_t('n6_tetikleyicinin_hepsini_kaydet'),6,c=>c.trigKinds,'n'),
  ...[[1,'b1','🌬️',_t('ilk_nefes')],[5,'b5','🫁',_t('nefes_ustasi')],[10,'b10','🍃',_t('on_nefes')],[20,'b20','🌊',_t('derin_nefes')],[50,'b50','🧘‍♂️',_t('nefes_bilgesi')],[100,'b100','🕉️',_t('yuz_nefes')]]
     .map(([n,id,e,nm])=>B('nefes',id,e,nm,n===1?_t('ilk_nefes_egzersizini_yap'):n+_t('nefes_egzersizi_2'),n,()=>S.stats.breaths,'n')),
  B('oyun','g1','🎮',_t('ilk_oyun'),_t('bir_oyun_oyna'),1,()=>S.stats.games||0,'n'),
  B('oyun','g10','🕹️',_t('oyuncu'),_t('n10_oyun_oyna'),10,()=>S.stats.games||0,'n'),
  B('oyun','g25','👾',_t('tutkun'),_t('n25_oyun_oyna'),25,()=>S.stats.games||0,'n'),
  B('oyun','g100','🏟️',_t('yuz_oyun'),_t('n100_oyun_oyna'),100,()=>S.stats.games||0,'n'),
  B('oyun','g50','🫧',_t('keskin_nisanci'),_t('baloncukta_tek_oyunda_50'),50,()=>S.stats.bestGame||0,'n'),
  B('oyun','bub100','🎈',_t('baloncuk_ustasi'),_t('baloncukta_tek_oyunda_100'),100,()=>S.stats.bestGame||0,'n'),
  B('oyun','mem','🃏',_t('hafiza_ustasi'),_t('hafiza_kartlarini_tamamla'),1,()=>S.stats.memWins||0,'n'),
  B('oyun','mem5','🧠',_t('guclu_hafiza'),_t('hafiza_kartlarini_5_kez_tamamla'),5,()=>S.stats.memWins||0,'n'),
  B('oyun','memM','🎴',_t('az_hamle'),_t('hafiza_kartlarini_14_hamle_ya'),1,()=>S.stats.memBestMoves && S.stats.memBestMoves<=14 ? 1 : 0,'n'),
  B('oyun','memT','⏱️',_t('simsek_hafiza'),_t('hafiza_kartlarini_45_saniyede_biti'),1,()=>S.stats.memBestTime && S.stats.memBestTime<=45 ? 1 : 0,'n'),
  B('oyun','tet','🧩',_t('blok_ustasi'),_t('blok_bulmacada_1_000_puan'),1000,()=>S.stats.bestBlocks||0,'n'),
  B('oyun','tet3k','🏗️',_t('blok_mimari'),_t('blok_bulmacada_3_000_puan'),3000,()=>S.stats.bestBlocks||0,'n'),
  B('oyun','tetL','📏',_t('satir_avcisi'),_t('blok_bulmacada_tek_oyunda_20'),20,()=>S.stats.bestLines||0,'n'),
  B('oyun','c4','🔴',_t('dort_bagladin'),_t('dort_bagla_da_bilgisayari_yen'),1,()=>S.stats.c4Wins||0,'n'),
  B('oyun','c4w5','🟣',_t('strateji_ustasi'),_t('dort_bagla_da_5_galibiyet'),5,()=>S.stats.c4Wins||0,'n'),
  B('oyun','c4h','♟️',_t('zoru_yendin'),_t('dort_bagla_da_zor_seviyede'),1,()=>S.stats.c4HardWins||0,'n'),
  B('aliskanlik','r1','🌙',_t('ilk_degerlendirme'),_t('gunu_ilk_kez_degerlendir'),1,c=>c.reviews,'n'),
  B('aliskanlik','r7','📔',_t('duzenli_gunluk'),_t('n7_aksam_degerlendirmesi'),7,c=>c.reviews,'n'),
  B('aliskanlik','r30','📚',_t('gunluk_ustasi'),_t('n30_aksam_degerlendirmesi'),30,c=>c.reviews,'n'),
  B('aliskanlik','r100','🗂️',_t('yuz_degerlendirme'),_t('n100_aksam_degerlendirmesi'),100,c=>c.reviews,'n'),
  B('aliskanlik','calm','😌',_t('sakin_gunler'),_t('n3_gunu_istek_duzeyi_2'),3,c=>c.calmDays,'n'),
  B('aliskanlik','happy','😄',_t('guzel_gunler'),_t('ruh_halini_7_gun_ya'),7,c=>c.happyDays,'n'),
  B('aliskanlik','w1','🥤',_t('ilk_su_hedefi'),_t('bir_gunde_8_bardak_su'),1,c=>c.waterDays,'n'),
  B('aliskanlik','w7','💧',_t('su_dostu'),_t('n7_gun_8_bardak_su'),7,c=>c.waterDays,'n'),
  B('aliskanlik','w30','🌊',_t('su_ustasi'),_t('n30_gun_8_bardak_su'),30,c=>c.waterDays,'n'),
  B('aliskanlik','w100','🏞️',_t('su_bilgesi'),_t('n100_gun_8_bardak_su'),100,c=>c.waterDays,'n'),
  B('aliskanlik','walk7','🚶',_t('yuruyuscu'),_t('n7_gun_yuruyus_hedefi'),7,c=>c.walkDays,'n'),
  B('aliskanlik','walk30','🥾',_t('gezgin'),_t('n30_gun_yuruyus_hedefi'),30,c=>c.walkDays,'n'),
  B('aliskanlik','cof7','☕',_t('temiz_kahve'),_t('n7_gun_kahveyi_sigarasiz_ic'),7,c=>c.coffeeDays,'n'),
  B('aliskanlik','p7','🗓️',_t('ilk_hafta_gorevleri'),_t('n7_program_gorevi'),7,c=>c.progDone,'n'),
  B('aliskanlik','p15','📅',_t('yari_yol'),_t('n15_program_gorevi'),15,c=>c.progDone,'n'),
  B('aliskanlik','p30','🏁',_t('program_tamam'),_t('n30_program_gorevi'),30,c=>c.progDone,'n'),
  B('aliskanlik','f1','✅',_t('mukemmel_gun'),_t('bir_gunun_tum_hedeflerini_tamamla'),1,c=>c.fullDays,'n'),
  B('aliskanlik','f7','🌟',_t('mukemmel_hafta'),_t('n7_mukemmel_gun'),7,c=>c.fullDays,'n'),
  B('aliskanlik','f30','💫',_t('mukemmel_ay'),_t('n30_mukemmel_gun'),30,c=>c.fullDays,'n'),
  B('ozel','share','📣',_t('ilham_kaynagi'),_t('basari_kartini_paylas_ya_da'),1,()=>S.stats.shares||0,'n'),
  B('ozel','share5','📢',_t('ses_getiren'),_t('basari_kartini_5_kez_paylas'),5,()=>S.stats.shares||0,'n'),
  B('ozel','goalset','📌',_t('hedef_koydun'),_t('bir_tasarruf_hedefi_belirle'),1,()=>S.goal&&S.goal.amount?1:0,'n'),
  B('ozel','bk','💾',_t('guvende'),_t('ilk_yedegini_al'),1,()=>S.backupAt||(S.gdrive&&S.gdrive.on)?1:0,'n'),
  B('ozel','sync','☁️',_t('bulutta'),_t('bulut_senkronunu_ac'),1,()=>S.sync.on?1:0,'n'),
  B('ozel','learn','📖',_t('merakli'),_t('bilgi_merkezinde_5_konu_oku'),5,()=>(S.stats.read||[]).length,'n'),
  B('ozel','learnAll','🎓',_t('bilgili'),_t('bilgi_merkezindeki_tum_konulari_ok'),8,()=>(S.stats.read||[]).length,'n'),
  B('ozel','back','🔁',_t('geri_donus'),_t('yeniden_basladiktan_sonra_3_gun'),3*D,c=>S.attempts.length?c.el:0,'time'),
  B('ozel','reduce','📉',_t('adim_adim'),_t('kademeli_birakma_planini_tamamla'),1,()=>S.reduce&&!S.reduce.aborted&&Date.now()>=S.quit?1:0,'n')
];

const LEVELS = [[0,_t('baslangic')],[100,_t('filiz')],[300,_t('fidan')],[700,_t('genc_agac')],[1500,_t('guclu_govde')],[3000,_t('ulu_cinar')],[6000,_t('orman')]];

const LEARN = [
  ['🧠',_t('nikotin_bagimliligi_nasil_olusur'),
   _t('sigaradan_cekilen_nikotin_yaklasik')],
  ['⚡',_t('sigara_istegi_neden_gelir'),
   _t('istegin_uc_kaynagi_vardir_fiziksel')],
  ['🌡️',_t('yoksunluk_belirtileri_nelerdir'),
   _t('sinirlilik_gerginlik_huzursuzluk_k')],
  ['📅',_t('ilk_hafta_neler_yasanir'),
   _t('n1_gun_karbonmonoksit_atilir_kararl')],
  ['⚖️',_t('kilo_alma_endisesi_nasil_yonetilir'),
   _t('birakanlarin_bir_kismi_kilo_alir')],
  ['🧘',_t('stresle_nasil_bas_edilir'),
   _t('nefes_4_saniye_al_2')],
  ['🩺',_t('profesyonel_destek_ve_tedavi'),
   _t('destek_almak_birakma_sansini_belir')],
  ['🔬',_t('bilimsel_kaynaklar_ve_uzman_oneril'),
   _t('bu_uygulamadaki_saglik_bilgileri_d')]
];

BADGES.find(b=>b.id==='learnAll').t = LEARN.length;
