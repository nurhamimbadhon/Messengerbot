module.exports = {
	config: {
		name: "dpg",
		aliases: ["dpg",],
		version: "1.0",
		author: "ShAn",
		countDown: 5,
		role: 0,
		shortDescription: "send you a girl photos",
		longDescription: "",
		category: "𝗜𝗠𝗔𝗚𝗘",
		guide: "{pn}"
	},

	onStart: async function ({ api, event, message }) {
	api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
	 var link = [
"https://i.postimg.cc/Xv83VgVt/FB-IMG-1738039817218.jpg",
"https://i.postimg.cc/pdxRbStD/FB-IMG-1738040113356.jpg",
"https://i.postimg.cc/tT4b7VJJ/FB-IMG-1738040165658.jpg",
"https://i.postimg.cc/T3nfs6Bd/FB-IMG-1738080670784.jpg",
"https://i.postimg.cc/X7CbZWjf/FB-IMG-1738080676360.jpg",
"https://i.postimg.cc/Dw5dFfF9/received-1322415705616426.jpg",
"https://i.postimg.cc/mD1QQQM4/received-599724546283521.jpg",
"https://i.postimg.cc/zfcCbdyp/received-9260557434026802.jpg",
"https://i.postimg.cc/9fMPf3Qr/received-968460828554489.jpg",
"https://i.postimg.cc/2jJY8yDj/FB-IMG-1738080681237.jpg",
"https://i.postimg.cc/SRwbZTrY/FB-IMG-1738080686392.jpg",
"https://i.postimg.cc/rsdLNXSL/FB-IMG-1738080691603.jpg",
"https://i.postimg.cc/C1rg8LnN/FB-IMG-1738080696399.jpg",
"https://i.postimg.cc/HxhqxZFv/FB-IMG-1737932417277.jpg",
"https://i.postimg.cc/QVLvgB8p/FB-IMG-1737932422139.jpg",
"https://i.postimg.cc/0jKLJGsk/FB-IMG-1737932429529.jpg",
"https://i.postimg.cc/66DQbYTh/FB-IMG-1737932435875.jpg",
"https://i.postimg.cc/VsS6F3s6/FB-IMG-1737932447128.jpg",
"https://i.postimg.cc/tRsSF1DL/received-1099039228384877.jpg",
"https://i.postimg.cc/gk9DRgxZ/received-1289431262303487.jpg",
"https://i.postimg.cc/c1thrpLW/received-1293860138428646.jpg",
"https://i.postimg.cc/cLhMpZXR/received-1297950281350536.jpg",
"https://i.postimg.cc/434wynm2/received-1319183962318667.jpg",
"https://i.postimg.cc/YC6Q175c/received-1339194517096060.jpg",
"https://i.postimg.cc/mrrNRq50/received-1379144949734319.jpg",
"https://i.postimg.cc/zfd7g5hz/received-1684852035710030.jpg",
"https://i.postimg.cc/fRfBMYT0/received-1726120174627545.jpg",
"https://i.postimg.cc/MHBmNQFH/received-1796191700955966.jpg",
"https://i.postimg.cc/Zqj3McYV/received-1807956426669050.jpg",
"https://i.postimg.cc/LXwVxTvG/received-3843828462557005.jpg",
"https://i.postimg.cc/15pKKDFY/received-560835000054749.jpg",
"https://i.postimg.cc/G36MKc59/received-566705282948000.jpg",
"https://i.postimg.cc/156vYLkB/received-574498185217418.jpg",
"https://i.postimg.cc/76fV1c1g/received-583986021237624.jpg",
"https://i.postimg.cc/6ptfbTL6/received-608937218323900.jpg",
"https://i.postimg.cc/FH5jdzng/received-610388044813636.jpg",
"https://i.postimg.cc/pTT8bFpx/received-615638224476804.jpg",
"https://i.postimg.cc/9QhL3LVh/received-9020867084662256.jpg",
"https://i.postimg.cc/8CTM43G7/received-905163345108572.jpg",
"https://i.postimg.cc/BbPKtfTV/received-915674180673548.jpg",
"https://i.postimg.cc/G90sygzh/received-948985723853637.jpg",
"https://i.postimg.cc/k4pSngbS/received-996744572277557.jpg",
"https://i.postimg.cc/dtdZVfLh/received-1298705714786207.jpg",
"https://i.postimg.cc/59XFZyJq/received-1890184778056107.jpg",
"https://i.postimg.cc/yxRxWJ6M/received-2044488039405855.jpg",
"https://i.postimg.cc/V6ddQGxL/received-587792734119024.jpg",
"https://i.postimg.cc/Kj3FQCdB/received-592824523557831.jpg",
"https://i.postimg.cc/ht1J978g/received-620767694233679.jpg",
"https://i.postimg.cc/d0QhntnC/received-627454769657188.jpg",
"https://i.postimg.cc/pT4y2QvQ/received-655403457059114.jpg",
"https://i.postimg.cc/6TsKPYXS/received-912152441087546.jpg",
"https://i.postimg.cc/7LBfR8QW/received-917937196992797.jpg",
"https://i.postimg.cc/Sxh22GMD/received-996078799085618.jpg",
"https://i.postimg.cc/8kxrDGP8/received-999316578733686.jpg",
"https://i.postimg.cc/3N50HVq4/FB-IMG-1738609297129.jpg",
"https://i.postimg.cc/d32kQnMW/FB-IMG-1738609301586.jpg",
"https://i.postimg.cc/cL9KJrjN/FB-IMG-1738609305073.jpg",
"https://i.postimg.cc/RVT6jPLh/FB-IMG-1738609314762.jpg",
"https://i.postimg.cc/J7NGkTgx/FB-IMG-1738609320078.jpg",
"https://i.postimg.cc/fLXk55bw/FB-IMG-1738609323725.jpg",
"https://i.postimg.cc/mDxgcMyK/FB-IMG-1738609327053.jpg",
"https://i.postimg.cc/D0P03ZsH/FB-IMG-1738609445456.jpg",
"https://i.postimg.cc/x85fFZVS/FB-IMG-1738609453014.jpg",
"https://i.postimg.cc/qvMh081L/FB-IMG-1738609640144.jpg",
"https://i.postimg.cc/8PGfX8Wx/FB-IMG-1738609643605.jpg",
"https://i.postimg.cc/Bb0bzD82/FB-IMG-1738609647866.jpg",
"https://i.postimg.cc/QMvHpvh4/FB-IMG-1738609662983.jpg",
"https://i.postimg.cc/wjGvpnyq/FB-IMG-1738609666334.jpg",
"https://i.postimg.cc/VL4v7Jzb/FB-IMG-1738609669613.jpg",
"https://i.postimg.cc/J0M7xLgq/FB-IMG-1738609672845.jpg",
"https://i.postimg.cc/vm44xGFx/FB-IMG-1738609861076.jpg",
"https://i.postimg.cc/y8dd27Np/FB-IMG-1738609866000.jpg",
"https://i.postimg.cc/yY7WXmCH/FB-IMG-1738609869358.jpg",
"https://i.postimg.cc/NM1fRMNF/FB-IMG-1738609873035.jpg",
"https://i.postimg.cc/SKYKNVCW/FB-IMG-1738609883172.jpg",
"https://i.postimg.cc/HWX7tWJQ/FB-IMG-1738609886498.jpg",
"https://i.postimg.cc/zBRH68xY/FB-IMG-1738609892118.jpg",
"https://i.postimg.cc/nrCR6s6c/FB-IMG-1738608578443.jpg",
"https://i.postimg.cc/26H9cd9K/FB-IMG-1738608582671.jpg",
"https://i.postimg.cc/ZYMD6cd9/FB-IMG-1738608586698.jpg",
"https://i.postimg.cc/rmYgCVK6/FB-IMG-1738608590492.jpg",
"https://i.postimg.cc/k5qj7YkH/FB-IMG-1738608604597.jpg",
"https://i.postimg.cc/rsZ642Lz/FB-IMG-1738608608330.jpg",
"https://i.postimg.cc/26mfRxwj/FB-IMG-1738608614082.jpg",
"https://i.postimg.cc/Gmy04fgh/FB-IMG-1738608618578.jpg",
"https://i.postimg.cc/jj0pPhB6/FB-IMG-1738608623180.jpg",
"https://i.postimg.cc/ZqxM3z8Z/FB-IMG-1738608733392.jpg",
"https://i.postimg.cc/x8hxYf2G/FB-IMG-1738608738206.jpg",
"https://i.postimg.cc/dVMHxVnw/FB-IMG-1738608742350.jpg",
"https://i.postimg.cc/wTR42mXw/FB-IMG-1738608747840.jpg",
"https://i.postimg.cc/QtM0T9Nk/FB-IMG-1738608766925.jpg",
"https://i.postimg.cc/T3r7MvHm/FB-IMG-1738608771500.jpg",
"https://i.postimg.cc/Gtmw9hVZ/FB-IMG-1738608775196.jpg",
"https://i.postimg.cc/JnqC1B6N/FB-IMG-1738608783917.jpg",
"https://i.postimg.cc/fTkQNyxd/FB-IMG-1738608788262.jpg",
"https://i.postimg.cc/sfTCq7Zy/FB-IMG-1738608791743.jpg",
"https://i.postimg.cc/sf6bwztg/FB-IMG-1738608837279.jpg",
"https://i.postimg.cc/C5Qt1Cjq/FB-IMG-1738609122968.jpg",
"https://i.postimg.cc/yxdtspSK/FB-IMG-1738609126678.jpg",
"https://i.postimg.cc/CLRX2tgH/FB-IMG-1738609132059.jpg",
"https://i.postimg.cc/T3mSdDhK/FB-IMG-1738609136433.jpg",
"https://i.postimg.cc/dtgpcBQM/FB-IMG-1738609139919.jpg",
"https://i.postimg.cc/G23SxgKD/FB-IMG-1738609150282.jpg",
"https://i.postimg.cc/1zQdf3NJ/FB-IMG-1738609156198.jpg",
"https://i.postimg.cc/9fdvp7j6/FB-IMG-1738609228407.jpg",
"https://i.postimg.cc/65SJ5K0m/FB-IMG-1738609233135.jpg",
"https://i.postimg.cc/d1ngMc3n/FB-IMG-1738609236053.jpg",
"https://i.postimg.cc/FRhwnHr7/FB-IMG-1738609241319.jpg",
"https://i.postimg.cc/NGkRcfgQ/FB-IMG-1738561260334.jpg",
"https://i.postimg.cc/9FXZF5MZ/FB-IMG-1738561271929.jpg",
"https://i.postimg.cc/gjshq4Mx/FB-IMG-1738561309616.jpg",
"https://i.postimg.cc/rsMWr796/FB-IMG-1738561325499.jpg",
"https://i.postimg.cc/fRJdmcYb/FB-IMG-1738561332277.jpg",
"https://i.postimg.cc/RVPfWs68/FB-IMG-1738561338306.jpg",
"https://i.postimg.cc/C5tZZqfY/received-1155708439397399.jpg",
"https://i.postimg.cc/SN22BDwK/received-1342140586978624.jpg",
"https://i.postimg.cc/4Nqtyrzt/received-1343019533513903.jpg",
"https://i.postimg.cc/zfmnt9v5/received-1391807405513812.jpg",
"https://i.postimg.cc/qvKK3jLF/received-1398411978203236.jpg",
"https://i.postimg.cc/8csJPHct/received-1512796676083440.jpg",
"https://i.postimg.cc/rFPGWdLD/received-1542543566404548.jpg",
"https://i.postimg.cc/rmM5cx5P/received-1604362920259562.jpg",
"https://i.postimg.cc/63cnQq05/received-1641057533464062.jpg",
"https://i.postimg.cc/sDv7VVZs/received-1792475834627181.jpg",
"https://i.postimg.cc/wxWD8tMw/received-1808830859914143.jpg",
"https://i.postimg.cc/V68W63P4/received-1877291599345183.jpg",
"https://i.postimg.cc/yN9T77tk/received-2644374319089169.jpg",
"https://i.postimg.cc/wTCygDpQ/received-3524506347684207.jpg",
"https://i.postimg.cc/xdKLWtNm/received-3917650718482626.gif",
"https://i.postimg.cc/wMbNhrZC/received-469448392889007.jpg",
"https://i.postimg.cc/sx2SGz6P/received-484378984449241.jpg",
"https://i.postimg.cc/gcBLtft5/received-557623980610689.gif",
"https://i.postimg.cc/j5Mnb9xD/received-627508086421902.gif",
"https://i.postimg.cc/HW39YZZ4/received-655645056793723.jpg",
"https://i.postimg.cc/KYyMrBp8/received-901130575427090.gif",
"https://i.postimg.cc/tTNtV2Xb/received-909089161432249.jpg",
"https://i.postimg.cc/pr0fsrh1/received-9653762761324813.jpg",
"https://i.postimg.cc/cLtRcssX/received-967047568225505.jpg",
"https://i.postimg.cc/T12jjgwD/received-967267185355948.jpg",
"https://i.postimg.cc/6pVRXQ6w/received-1125436536047344.jpg",
"https://i.postimg.cc/bNtkmTKZ/received-1146650177133327.jpg",
"https://i.postimg.cc/Hxn7X4ws/received-1792028408229460.jpg",
"https://i.postimg.cc/JzCJvXLP/received-2363504527363994.jpg",
"https://i.postimg.cc/VNYtLc5t/received-496936843070398.jpg",
"https://i.postimg.cc/k5fb2htp/received-635040238921321.jpg",
"https://i.postimg.cc/QCR5X9WN/received-8849637488492934.jpg",
"https://i.postimg.cc/K8Fz2rsp/FB-IMG-1738610180605.jpg",
"https://i.postimg.cc/rpZF56y7/FB-IMG-1738610182631.jpg",
"https://i.postimg.cc/T2DY5HzH/FB-IMG-1738610188684.jpg",
"https://i.postimg.cc/gkbcVHdc/FB-IMG-1738610191106.jpg",
"https://i.postimg.cc/jqwCQj7c/FB-IMG-1738610260601.jpg",
"https://i.postimg.cc/hPVj63M7/FB-IMG-1738610262711.jpg",
"https://i.postimg.cc/vZzmHgJY/FB-IMG-1738610266955.jpg",
"https://i.postimg.cc/WpBz9Pmv/FB-IMG-1738610269659.jpg",
"https://i.postimg.cc/wvtxVW7M/FB-IMG-1738610282112.jpg",
"https://i.postimg.cc/Pq55LfHm/FB-IMG-1738610284334.jpg",
"https://i.postimg.cc/J0ZrwG3W/FB-IMG-1738610730731.jpg",
"https://i.postimg.cc/4drfFz95/FB-IMG-1738610736705.jpg",
"https://i.postimg.cc/yW4M0jSM/FB-IMG-1738610741553.jpg",
"https://i.postimg.cc/K8Fz2rsp/FB-IMG-1738610180605.jpg",
"https://i.postimg.cc/rpZF56y7/FB-IMG-1738610182631.jpg",
"https://i.postimg.cc/T2DY5HzH/FB-IMG-1738610188684.jpg",
"https://i.postimg.cc/gkbcVHdc/FB-IMG-1738610191106.jpg",
"https://i.postimg.cc/26fCfnG8/FB-IMG-1738609861076.jpg",
"https://i.postimg.cc/MZ5qhMQq/FB-IMG-1738609866000.jpg",
"https://i.postimg.cc/BbSsjsRr/FB-IMG-1738609869358.jpg",
"https://i.postimg.cc/8PnDz24Y/FB-IMG-1738609873035.jpg",
"https://i.postimg.cc/RV049S7f/FB-IMG-1738609883172.jpg",
"https://i.postimg.cc/VsWkmZ3y/FB-IMG-1738609886498.jpg",
"https://i.postimg.cc/QM7jPfpy/FB-IMG-1738609892118.jpg",
"https://i.postimg.cc/fy8sXpNJ/FB-IMG-1738609997748.jpg",
"https://i.postimg.cc/d1mwQDNR/FB-IMG-1738610001059.jpg",
"https://i.postimg.cc/6p2K2M1p/FB-IMG-1738610004469.jpg",
"https://i.postimg.cc/sDfDX9rM/FB-IMG-1738610011846.jpg",
"https://i.postimg.cc/vHP86gY3/FB-IMG-1738610046064.jpg",
"https://i.postimg.cc/VkpYDxbt/FB-IMG-1738610049331.jpg",
"https://i.postimg.cc/0ybkGkrx/FB-IMG-1738610052804.jpg",
	 ]
let img = link[Math.floor(Math.random()*link.length)]
api.setMessageReaction("✅", event.messageID, (err) => {}, true);
message.send({
	body: '「 EI NAW TMR DPZ😎  」',attachment: await global.utils.getStreamFromURL(img)
})
}
		 }
