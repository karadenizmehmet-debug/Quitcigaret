/* Nefes – sabit veriler: dönüm noktaları, mesajlar, tetikleyiciler, hedefler
   Mehmet Karadeniz, 2026-2027 */

/* ================= Sabitler ================= */
const KEY = 'nefes_v2';
const MIN = 60e3, H = 60*MIN, D = 24*H;

const MS = [
  [20*MIN, _t('nabiz_ve_tansiyon_normale_donmeye'), _t('nikotinin_damarlari_daraltici_etki')],
  [8*H,    _t('kandaki_karbonmonoksit_yariya_iner'), _t('sigara_dumanindaki_karbonmonoksit')],
  [24*H,   _t('karbonmonoksit_vucuttan_buyuk_olcu'), _t('kalp_krizi_riski_azalmaya_baslar')],
  [48*H,   _t('tat_ve_koku_duyulari_keskinlesir'), _t('zarar_gormus_sinir_uclari_yeniden')],
  [72*H,   _t('bronslar_gevser_nefes_almak_kolayl'), _t('akciger_kapasitesi_artmaya_baslar')],
  [14*D,   _t('kan_dolasimi_iyilesir_yurumek_kola'), _t('dolasim_ve_akciger_fonksiyonu_2')],
  [90*D,   _t('akciger_fonksiyonu_belirgin_sekild'), _t('akciger_fonksiyonunda_10_a_varan')],
  [270*D,  _t('oksuruk_ve_nefes_darligi_azalir'), _t('akcigerlerdeki_tuysu_yapilar_silya')],
  [365*D,  _t('koroner_kalp_hastaligi_riski_yariy'), _t('bir_yil_sonra_kalp_hastaligi')],
  [5*365*D,_t('inme_riski_icmeyen_birinin_duzeyin'), _t('agiz_bogaz_yemek_borusu_ve')],
  [10*365*D,_t('akciger_kanseri_riski_yaklasik_yar'), _t('akciger_kanserinden_olum_riski_icm')],
  [15*365*D,_t('kalp_hastaligi_riski_hic_icmemis'), _t('koroner_kalp_hastaligi_riski_hic')]
];


const MOTTOS = [
  _t('bugun_icmedigin_her_sigara_yarin'),
  _t('istek_bir_dalga_gibidir_yukselir'),
  _t('birakmak_bir_kere_verilen_karar'),
  _t('vucudun_su_anda_kendini_onariyor'),
  _t('zor_olan_ilk_gunlerdi_sen'),
  _t('sigara_stresi_azaltmaz_sadece_yoks'),
  _t('kendine_verdigin_soz_baskalarina_v'),
  _t('her_hayir_bir_sonrakini_kolaylasti'),
  _t('biriktirdigin_para_kendine_yaptigi'),
  _t('ailen_ve_sevdiklerin_daha_temiz'),
  _t('mukemmel_olmak_zorunda_degilsin_de'),
  _t('bir_kriz_atlattiginda_beynin_yeni'),
  _t('nefes_almak_bir_hak_onu'),
  _t('bugun_bir_gun_daha_bu'),
  _t('merdiveni_cikarken_nefesin_daha_az')
];

const TRIGS = [
  ['stres',_t('stresliyim'),'😣',_t('nikotin_stresi_azaltiyormus_gibi_h')],
  ['sikinti',_t('canim_sikiliyor'),'😐',_t('can_sikintisi_en_sik_tetikleyicile')],
  ['kahve',_t('kahve_iciyorum'),'☕',_t('kahve_ve_sigara_beyninde_birbirine')],
  ['cay',_t('cay_iciyorum'),'🫖',_t('cay_ve_sigara_birlikte_gelen')],
  ['yemek',_t('yemekten_sonra'),'🍽️',_t('yemek_sonrasi_aliskanligi_kirmak_i')],
  ['arkadas',_t('arkadas_ortami'),'👥',_t('sigara_icen_arkadaslarina_biraktig')],
  ['nikotin',_t('nikotin_istegi'),'🧲',_t('fiziksel_istek_gercek_ama_gecici')]
];

const GOALS = [['smokefree',_t('bugun_sigarasiz'),'auto'],['water',_t('n8_bardak_su'),'count'],['walk',_t('n15_dakika_yuruyus'),'check'],['breath',_t('n1_nefes_egzersizi'),'auto'],['coffee',_t('kahveyi_sigarasiz_ic'),'check']];
const PRESETS = [_t('telefon'),_t('tatil'),_t('bilgisayar'),_t('hediye'),_t('bisiklet')];
const MOODS = ['😫','😕','😐','🙂','😄'];
