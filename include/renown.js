//TITLE
function renownTitle(statRenown) {
  switch (true){
    case(statRenown <= 100):
      var statRenownTitle = "Beginner";
      break;

    case(statRenown > 100 && statRenown <= 200):
      var statRenownTitle = "Rookie";
      break;

    case(statRenown > 200 && statRenown <= 290):
      var statRenownTitle = "The Skilled";
      break;

    case(statRenown > 290 && statRenown <= 380):
      var statRenownTitle = "The Dark Horse";
      break;

    case(statRenown > 380 && statRenown <= 450):
      var statRenownTitle = "The Veteran";
      break;

    case(statRenown > 450 && statRenown <= 535):
      var statRenownTitle = "The Undaunted";
      break;

    case(statRenown > 535 && statRenown <= 553):
      var statRenownTitle = "The Noble One";
      break;

    case(statRenown > 553):
      var statRenownTitle = "The Great One";
      break;
  }
  return statRenownTitle;
}

//AP
function renownAP(statRenown){
  switch (true){
    case(statRenown <= 87):
      var statRenownAP = 0;
      break;

    case(statRenown >= 88 && statRenown <= 162):
      var statRenownAP = 4;
      break;

    case(statRenown >= 163 && statRenown <= 210):
      var statRenownAP = 4;
      break;

    case(statRenown >= 211 && statRenown <= 469):
      var statRenownAPDiffernece = Math.floor((statRenown - 211)/41);
      var statRenownAP = 6 + (2 * statRenownAPDiffernece);
      break;

    case(statRenown >= 470):
      var statRenownAP = 20;
      break;
  }
  return statRenownAP;
}

//DR
function renownDR(statRenown){
  switch (true){
    case(statRenown <= 67):
      var statRenownDR = 0;
      break;

    case(statRenown >= 68 && statRenown <= 122):
      var statRenownDR = 1;
      break;

    case(statRenown >= 123 && statRenown <= 190):
      var statRenownDR = 2;
      break;

    case(statRenown >= 191 && statRenown <= 231):
      var statRenownDR = 3;
      break;

    case(statRenown >= 232 && statRenown <= 271):
      var statRenownDR = 4;
      break;

    case(statRenown >= 272 && statRenown <= 435):
      var statRenownDPDiffernece = Math.floor((statRenown - 272)/41);
      var statRenownDR = 5 + (statRenownDPDiffernece);
      break;

    case(statRenown >= 436 && statRenown <= 462):
      var statRenownDR = 9;
      break;

    case(statRenown >= 463):
      var statRenownDPDiffernece = Math.floor((statRenown - 463)/7);
      var statRenownDR = 10 + (4 * statRenownDPDiffernece);
      break;
  }
  return statRenownDR;
}

//AP SCALE
function scaleAP(statAP){
  switch (true){
    case(statAP <= 99):
      var scaleAP = 0;
      break;

    case(statAP >= 100 && statAP <= 139):
      var scaleAP = 5;
      break;

    case(statAP >= 140 && statAP <= 169):
      var scaleAP = 10;
      break;

    case(statAP >= 170 && statAP <= 183):
      var scaleAP = 15;
      break;

    case(statAP >= 184 && statAP <= 208):
      var scaleAP = 20;
      break;

    case(statAP >= 209 && statAP <= 234):
      var scaleAP = 30;
      break;

    case(statAP >= 235 && statAP <= 244):
      var scaleAP = 40;
      break;

    case(statAP >= 245 && statAP <= 248):
      var scaleAP = 48;
      break;

    case(statAP >= 249 && statAP <= 252):
      var scaleAP = 57;
      break;

    case(statAP >= 253 && statAP <= 256):
      var scaleAP = 69;
      break;

    case(statAP >= 257 && statAP <= 260):
      var scaleAP = 83;
      break;

    case(statAP >= 261 && statAP <= 264):
      var scaleAP = 101;
      break;

    case(statAP >= 265 && statAP <= 268):
      var scaleAP = 122;
      break;

    case(statAP >= 269 && statAP <= 272):
      var scaleAP = 137;
      break;

    case(statAP >= 273 && statAP <= 276):
      var scaleAP = 142;
      break;

    case(statAP >= 277 && statAP <= 280):
      var scaleAP = 148;
      break;

    case(statAP >= 281 && statAP <= 284):
      var scaleAP = 154;
      break;

    case(statAP >= 285 && statAP <= 304):
      var statAPDiffernece = Math.floor((statAP - 285)/4);
      var scaleAP = 160 + (statAPDiffernece * 7);
      break;

    case(statAP >= 305 && statAP <= 308):
      var scaleAP = 196;
      break;

    case(statAP >= 309):
      var scaleAP = 200;
      break;
  }
  return scaleAP;
}

//DR SCALE
function scaleDR(statDP){
  switch (true) {
    case(statDP <= 202):
      var scaleDR = 0;
      break;

    case(statDP >= 203 && statDP <= 210):
      var scaleDR = 1;
      break;

    case(statDP >= 211 && statDP <= 217):
      var scaleDR = 2;
      break;

    case(statDP >= 218 && statDP <= 225):
      var scaleDR = 3;
      break;

    case(statDP >= 226 && statDP <= 232):
      var scaleDR = 4;
      break;

    case(statDP >= 233 && statDP <= 240):
      var scaleDR = 5;
      break;

    case(statDP >= 241 && statDP <= 247):
      var scaleDR = 6;
      break;

    case(statDP >= 248 && statDP <= 255):
      var scaleDR = 7;
      break;

    case(statDP >= 256 && statDP <= 262):
      var scaleDR = 8;
      break;

    case(statDP >= 263 && statDP <= 270):
      var scaleDR = 9;
      break;

    case(statDP >= 271 && statDP <= 277):
      var scaleDR = 10;
      break;

    case(statDP >= 278 && statDP <= 285):
      var scaleDR = 11;
      break;

    case(statDP >= 286 && statDP <= 292):
      var scaleDR = 12;
      break;

    case(statDP >= 293 && statDP <= 300):
      var scaleDR = 13;
      break;

    case(statDP >= 301 && statDP <= 308):
      var scaleDR = 14;
      break;

    case(statDP >= 309 && statDP <= 315):
      var scaleDR = 15;
      break;

    case(statDP >= 316 && statDP <= 323):
      var scaleDR = 16;
      break;

    case(statDP >= 324 && statDP <= 330):
      var scaleDR = 17;
      break;

    case(statDP >= 331 && statDP <= 338):
      var scaleDR = 18;
      break;

    case(statDP >= 339 && statDP <= 345):
      var scaleDR = 19;
      break;

    case(statDP >= 346):
      var scaleDR = 20;
      break;
  }
  return scaleDR;
}

//CLASS NAME
function renownClassName(statsClass){
  switch(true){
    case statsClass.includes("war"):
      var statsClassFull = "Warrior";
      break;

    case statsClass.includes("valk"):
      var statsClassFull = "Valkyrie";
      break;

    case statsClass.includes("ranger"):
      var statsClassFull = "Ranger";
      break;

    case statsClass.includes("sorc"):
      var statsClassFull = "Sorceress";
      break;

    case statsClass.includes("erker"):
      var statsClassFull = "Berserker";
      break;

    case statsClass.includes("giant"):
      var statsClassFull = "Berserker";
      break;

    case statsClass.includes("wiz"):
      var statsClassFull = "Wizard";
      break;

    case statsClass.includes("witch"):
      var statsClassFull = "Witch";
      break;

    case statsClass.includes("tamer"):
      var statsClassFull = "Tamer";
      break;

    case statsClass.includes("musa"):
      var statsClassFull = "Musa";
      break;

    case statsClass.includes("mae"):
      var statsClassFull = "Maehwa";
      break;

    case statsClass.includes("ninja"):
      var statsClassFull = "Ninja";
      break;

    case statsClass.includes("kuno"):
      var statsClassFull = "Kunoichi";
      break;

    case statsClass.includes("dark"):
      var statsClassFull = "Dark Knight";
      break;

    case statsClass.includes("dk"):
      var statsClassFull = "Dark Knight";
      break;

    case statsClass.includes("striker"):
      var statsClassFull = "Striker";
      break;

    case statsClass.includes("mystic"):
      var statsClassFull = "Mystic";
      break;

    case statsClass.includes("lahn"):
      var statsClassFull = "Lahn";
      break;

    case statsClass.includes("archer"):
      var statsClassFull = "Archer";
      break;

    case statsClass.includes("shai"):
      var statsClassFull = "Shai";
      break;

    case statsClass.includes("guard"):
      var statsClassFull = "Guardian";
      break;
  }
  return statsClassFull;
}

//CLASS ICON
function renownClassIcon(statClass){
  switch (statClass){
    case("Warrior"):
      var statClassIcon = "https://i.imgur.com/SbvhUp0.png";
      break;

    case("Valkyrie"):
      var statClassIcon = "https://i.imgur.com/U1R1SgQ.png";
      break;

    case("Ranger"):
      var statClassIcon = "https://i.imgur.com/rxjpewm.png";
      break;

    case("Sorceress"):
      var statClassIcon = "https://i.imgur.com/dlbqvxo.png";
      break;

    case("Berserker"):
      var statClassIcon = "https://i.imgur.com/YIOgLAy.png";
      break;

    case("Wizard"):
      var statClassIcon = "https://i.imgur.com/iI2Lek3.png";
      break;

    case("Witch"):
      var statClassIcon = "https://i.imgur.com/kc3yxBJ.png";
      break;

    case("Tamer"):
      var statClassIcon = "https://i.imgur.com/teVEHBM.png";
      break;

    case("Musa"):
      var statClassIcon = "https://i.imgur.com/lEm8uvb.png";
      break;

    case("Maehwa"):
      var statClassIcon = "https://i.imgur.com/fDBrYOb.png";
      break;

    case("Ninja"):
      var statClassIcon = "https://i.imgur.com/pGG4pfZ.png";
      break;

    case("Kunoichi"):
      var statClassIcon = "https://i.imgur.com/EmqXfxo.png";
      break;

    case("Dark Knight"):
      var statClassIcon = "https://i.imgur.com/Kg3NqVL.png";
      break;

    case("Striker"):
      var statClassIcon = "https://i.imgur.com/QKiK9Zd.png";
      break;

    case("Mystic"):
      var statClassIcon = "https://i.imgur.com/lhizJSm.png";
      break;

    case("Lahn"):
      var statClassIcon = "https://i.imgur.com/13xAcQc.png";
      break;

    case("Archer"):
      var statClassIcon = "https://i.imgur.com/WlfaRl8.png";
      break;

    case("Shai"):
      var statClassIcon = "https://i.imgur.com/7kpX3Y7.png";
      break;

    case("Guardian"):
      var statClassIcon = "https://i.imgur.com/tmz1D1o.png";
      break;
  }
  return statClassIcon;
}

module.exports = {
  renownTitle: renownTitle,
  renownAP: renownAP,
  renownDR: renownDR,
  scaleAP: scaleAP,
  scaleDR: scaleDR,
  renownClassName: renownClassName,
  renownClassIcon: renownClassIcon,
}
