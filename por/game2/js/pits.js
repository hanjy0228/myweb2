/** @Copyright sfg1991@163.com */
var listen = function (obj, e, trigger) {
  if (obj) {
    if (obj.addEventListener) {
      obj.addEventListener(e, trigger);
    } else if (obj.bind) {
      obj.bind(e, trigger);
    }
  }
};
var resizeWinTimeout = null;
var resizeWin = function () {
  resizeWinTimeout && clearTimeout(resizeWinTimeout);
  resizeWinTimeout = setTimeout(function () {
    var curUrl = location.href;
    var index = curUrl.indexOf('?')
    if (index > -1) {
      curUrl = curUrl.substring(0, index)
    }
    location.href = curUrl + '?d=' + (new Date().getTime());
  }, 500);
};
var addClass = function (obj, arr) {
  if (!obj || !arr || !arr.length) {
    return;
  }
  var currentClass = obj.className;
  if (!currentClass) {
    obj.className = arr.join(' ');
  } else {
    var currentArr = currentClass.split(' ').filter(function (s) {
      return !!s;
    });
    var addedCount = 0;
    arr.forEach(function (c) {
      if (currentArr.indexOf(c) == -1) {
        currentArr.push(c);
        ++addedCount;
      }
    });
    addedCount > 0 && (obj.className = currentArr.join(' '));
  }
};
var removeClass = function (obj, arr) {
  if (!obj || !obj.className || !arr || !arr.length) {
    return;
  }
  var currentClass = obj.className;

  var currentArr = currentClass.split(' ').filter(function (s) {
    return !!s;
  });
  var removedCount = 0;
  arr.forEach(function (c) {
    var index = currentArr.indexOf(c);
    if (index != -1) {
      currentArr.splice(index, 1);
      ++removedCount;
    }
  });
  removedCount > 0 && (obj.className = currentArr.join(' '));
};
var renderCenterRect = function (obj, edge, screenWidth) {
  if (!obj) {
    return;
  }
  obj.style.width = edge + 'px';
  obj.style.height = edge + 'px';
  obj.style.left = (screenWidth - edge) / 2 + 'px';
};
var renderRect = function (obj, edge) {
  if (!obj) {
    return;
  }
  obj.style.width = edge + 'px';
  obj.style.height = edge + 'px';
};
var renderLeft = function (obj, left) {
  obj && (obj.style.left = left + 'px');
};
var renderRight = function (obj, right) {
  obj && (obj.style.right = right + 'px');
};
var renderTop = function (obj, top) {
  obj && (obj.style.top = top + 'px');
};
var renderHeight = function (obj, height) {
  obj && (obj.style.height = height + 'px');
};
var renderWidth = function (obj, width) {
  obj && (obj.style.width = width + 'px');
};
var isMobile = function () {
  var sUserAgent= navigator.userAgent.toLowerCase(),
  isIpad= sUserAgent.match(/ipad/i) == "ipad",
  isIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
  isMidp= sUserAgent.match(/midp/i) == "midp",
  isUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
  isUc= sUserAgent.match(/ucweb/i) == "ucweb",
  isAndroid= sUserAgent.match(/android/i) == "android",
  isCE= sUserAgent.match(/windows ce/i) == "windows ce",
  isWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
  isWebview = sUserAgent.match(/webview/i) == "webview";
  return (isIpad || isIphoneOs || isMidp || isUc7 || isUc || isAndroid || isCE || isWM);
};
var init = function () {
  var screenWidth = document.body.clientWidth;
  var screenHeight = document.body.clientHeight;
  var edgeLength = screenWidth < screenHeight ? screenWidth : screenHeight;
  var maxPitEdge = edgeLength / 5;
  var minPitEdge = maxPitEdge * 0.2;
  var currentPitEdge = maxPitEdge;
  (minPitEdge > 20) && (minPitEdge = 20);
  var minFillingEdge = minPitEdge / 2;
  var maxFillingEdge = maxPitEdge * 2;
  var currentFillingEdge = minFillingEdge;

  document.body.className = screenWidth >= screenHeight ? 'horizontal' : 'vertical';

  var mainContainer = document.querySelector('#main-container');
  var pitOne = document.querySelector('#pit-one');
  var pitTwo = document.querySelector('#pit-two');
  var fillingOne = document.querySelector('#filling-one');
  var fillingTwo = document.querySelector('#filling-two');
  var player = document.querySelector('#player');
  var award = document.querySelector('#award');
  var score = document.querySelector('#score');
  var scoreContainer = document.querySelector('#score-container');
  var resultContainer = document.querySelector('#result-container');
  var resultScore = document.querySelector('#result-score');
  var resultMsg = document.querySelector('#result-msg');
  var logo = document.querySelector('#logo');
  var navContainer = document.querySelector('#nav-container');
  var currentPit = pitOne;
  var currentFilling = fillingOne;
  var nextPit = pitTwo;
  var nextFilling = fillingTwo;

  var canEnlarge = false;
  var enlarging = false;
  var scoreCount = 0;
  var enlargeInterval;

  var ANIM_DURATION = 200;
  var WALK_THROUGH_RESULT= {
    THROUGH: 0,
    TOO_WIDE: 1,
    TOO_HIGH: 2,
    BLOCK: 3
  };
  var MSGS = ['太远了，过不去', '摔死啦', '撞墙啦'];
  var WALK_THROUGH_MAX_WIDTH_MIN_THRESHOLD = 5;
  var WALK_THROUGH_MAX_WIDTH_MAX_THRESHOLD = 15;
  var WALK_THROUGH_MAX_HEIGHT_MIN_THRESHOLD = 10;
  var WALK_THROUGH_MAX_HEIGHT_MAX_THRESHOLD = 30;
  var WALK_THROUGH_MAX_WIDTH = 5;
  var WALK_THROUGH_MAX_HEIGHT = 10;
  var HIDE_CLASS = 'hide';
  var TRANSPARENT_CLASS = 'transparent';
  var SMOOTH_CLASS = 'smooth';
  var EMPHASIZED_CLASS = 'emphasized';

  var touchStart, touchMove, touchEnd;
  if (isMobile()) {
    touchStart = 'touchstart';
    touchMove = 'touchmove';
    touchEnd = 'touchend';
  } else {
    touchStart = 'mousedown';
    touchMove = 'mousemove';
    touchEnd = 'mouseup';
  }

  var openAbout = function () { addClass(document.querySelector('#about-container'), ['show']); };
  var closeAbout = function () { removeClass(document.querySelector('#about-container'), ['show']); };
  var openIntro = function () { addClass(document.querySelector('#intro-container'), ['show']); };
  var closeIntro = function () { removeClass(document.querySelector('#intro-container'), ['show']); };
  var startGame = function () {
    initGame();
    addClass(logo, [TRANSPARENT_CLASS]);
    addClass(navContainer, [TRANSPARENT_CLASS]);
    setTimeout(function () {
      addClass(logo, [HIDE_CLASS]);
      addClass(navContainer, [HIDE_CLASS]);
    }, ANIM_DURATION);
  };
  var initGame = function () {
    canEnlarge = false;
    scoreCount = 0;
    currentFillingEdge = minFillingEdge;
    enlargeInterval && clearInterval(enlargeInterval);

    initPlayer();
    score.innerHTML = scoreCount;
    removeClass(scoreContainer, [HIDE_CLASS, TRANSPARENT_CLASS]);
    removeClass(currentFilling, [HIDE_CLASS]);
    renderTop(currentFilling, 20);
    renderCenterRect(currentFilling, currentFillingEdge, screenWidth);
    renderCenterRect(currentPit, currentPitEdge, screenWidth);
    setWalkMaxVal();
    setTimeout(function () {
      removeClass(currentFilling, [SMOOTH_CLASS]);
      canEnlarge = true;
    }, ANIM_DURATION);
  };
  var startEnlargement = function () {
    if (canEnlarge) {
      canEnlarge = false;
      enlarging = true;
      enlargeInterval && clearInterval(enlargeInterval);
      enlargeInterval = setInterval(function () {
        currentFillingEdge < maxFillingEdge && (currentFillingEdge += 1);
        renderCenterRect(currentFilling, currentFillingEdge, screenWidth);
      }, 10);
    }
  };
  var stopEnlargementAndStartFallDown = function (e) {
    if (enlarging && enlargeInterval) {
      e.preventDefault();
      e.returnValue = false;
      enlarging = false;
      clearInterval(enlargeInterval);
      enlargeInterval = null;
      addClass(currentFilling, [SMOOTH_CLASS]);
      var fillingTop = screenHeight * 0.5 - currentFillingEdge;
      var canFill = canFillIn(currentFillingEdge, currentPitEdge);
      if (canFill) {
        fillingTop += currentPitEdge;
      }
      renderTop(currentFilling, fillingTop);
      setTimeout(function () {
        removeClass(currentFilling, [SMOOTH_CLASS]);
        moveForward(canFill);
      }, ANIM_DURATION);
    }
  };
  var moveForward = function (canFillIn) {
    if (canFillIn) {
      switch (walkThroughResult(currentFillingEdge, currentPitEdge)) {
        case WALK_THROUGH_RESULT.THROUGH:
          renderLeft(player, screenWidth * 0.75 - player.clientWidth / 2);
          setTimeout(function () {
            addClass(award, [SMOOTH_CLASS]);
            renderRight(award, 20 + score.clientWidth);
            renderTop(award, 20 - screenHeight / 2);
            setTimeout(function () {
              removeClass(award, [SMOOTH_CLASS]);
              addClass(award, [HIDE_CLASS]);
              addClass(score, [EMPHASIZED_CLASS]);
              score.innerHTML = ++scoreCount;
              setTimeout(function () {
                removeClass(score, [EMPHASIZED_CLASS]);
              }, ANIM_DURATION);
              mapForward();
            }, ANIM_DURATION);
          }, ANIM_DURATION);
          break;
        case WALK_THROUGH_RESULT.TOO_WIDE:
          renderLeft(player, (screenWidth - currentPitEdge) / 2);
          setTimeout(function () {
            renderTop(player, currentPitEdge - player.clientHeight);
            setTimeout(function () { showScore(WALK_THROUGH_RESULT.TOO_WIDE); }, ANIM_DURATION);
          }, ANIM_DURATION);
          break;
        case WALK_THROUGH_RESULT.TOO_HIGH:
          renderLeft(player, (screenWidth - currentPitEdge) / 2);
          setTimeout(function () {
            renderTop(player, currentPitEdge - currentFillingEdge - player.clientHeight);
            setTimeout(function () { showScore(WALK_THROUGH_RESULT.TOO_HIGH); }, ANIM_DURATION);
          }, ANIM_DURATION);
          break;
      }
    } else {
      renderLeft(player, (screenWidth - currentFillingEdge) / 2 - player.clientWidth);
      setTimeout(function () {
        showScore(WALK_THROUGH_RESULT.BLOCK);
      }, ANIM_DURATION);
    }
  };
  var mapForward = function () {
    initOverflowElements();
    moveCurrentElements();
    moveOverflowElements();
    exchangeElementsRole();
    enableEnlargement();
  };
  var initOverflowElements = function () {
    removeClass(nextFilling, [SMOOTH_CLASS]);
    removeClass(nextPit, [SMOOTH_CLASS]);
    removeClass(award, [SMOOTH_CLASS, HIDE_CLASS]);
    currentFillingEdge = minFillingEdge;
    currentPitEdge = calRandomPitEdge(minPitEdge, maxPitEdge);
    setWalkMaxVal();
    renderRect(nextFilling, currentFillingEdge);
    renderRect(nextPit, currentPitEdge);
    renderTop(nextFilling, 20);
    renderLeft(nextFilling,  screenWidth + currentFillingEdge);
    renderLeft(nextPit, screenWidth + currentPitEdge);
    renderRight(award, -(screenWidth / 2));
    renderTop(award, -award.clientHeight);
  };
  var moveCurrentElements = function () {
    renderLeft(currentPit, -currentPit.clientWidth);
    renderLeft(currentFilling, -currentFilling.clientWidth);
    renderLeft(player, screenWidth * 0.2);
  };
  var moveOverflowElements = function () {
    addClass(nextFilling, [SMOOTH_CLASS]);
    addClass(nextPit, [SMOOTH_CLASS]);
    addClass(award, [SMOOTH_CLASS]);
    renderLeft(nextFilling, (screenWidth - currentFillingEdge) / 2);
    renderLeft(nextPit, (screenWidth - currentPitEdge) / 2);
    renderRight(award, screenWidth * 0.2);
    setTimeout(function () {
      removeClass(currentFilling  , [SMOOTH_CLASS]);
      removeClass(nextFilling, [SMOOTH_CLASS]);
    }, ANIM_DURATION);
  };
  var exchangeElementsRole = function () {
    var tmp = nextFilling;
    nextFilling = currentFilling;
    currentFilling = tmp;
    tmp = nextPit;
    nextPit = currentPit;
    currentPit = tmp;
  };
  var enableEnlargement = function () {
    setTimeout(function () {
      canEnlarge = true;
    }, ANIM_DURATION * 2);
  };
  var canFillIn = function (fillEdge, pitEdge) {
    return fillEdge <= pitEdge;
  };
  var walkThroughResult = function (fillEdge, pitEdge) {
    var gapHeight = pitEdge - fillEdge;
    var gapWidth = gapHeight / 2;
    if (gapWidth > WALK_THROUGH_MAX_WIDTH) {
      return WALK_THROUGH_RESULT.TOO_WIDE;
    }
    if (gapHeight > WALK_THROUGH_MAX_HEIGHT) {
      return WALK_THROUGH_RESULT.TOO_HIGH;
    }
    return WALK_THROUGH_RESULT.THROUGH;
  };
  var calRandomPitEdge = function (minVal, maxVal) {
    var edge = parseInt(minVal + (maxVal - minVal) * Math.random());
    return edge > maxVal ? maxVal : edge < minVal ? minVal : edge;
  };
  var showScore = function (type) {
    type = parseInt(type);
    var msg = '失败啦';
    if (type >= 1 && type <= 3) {
      msg = MSGS[type - 1];
    }
    resultScore.innerHTML = scoreCount;
    resultMsg.innerHTML = msg;
    addClass(resultContainer, [SMOOTH_CLASS]);
    removeClass(resultContainer, [HIDE_CLASS, TRANSPARENT_CLASS]);
  };
  var replay = function () {
    addClass(resultContainer, [TRANSPARENT_CLASS])
    setTimeout(function () {
      addClass(resultContainer, [HIDE_CLASS]);
    }, ANIM_DURATION);
    initGame();
  };
  var goHome = function () {
    addClass(currentFilling, [TRANSPARENT_CLASS]);
    addClass(resultContainer, [TRANSPARENT_CLASS]);
    addClass(scoreContainer, [TRANSPARENT_CLASS]);
    setTimeout(function () {
      addClass(currentFilling, [HIDE_CLASS]);
      addClass(resultContainer, [HIDE_CLASS]);
      addClass(scoreContainer, [HIDE_CLASS]);
      removeClass(logo, [HIDE_CLASS, TRANSPARENT_CLASS]);
      removeClass(navContainer, [HIDE_CLASS, TRANSPARENT_CLASS]);
      renderHeight(currentPit, screenHeight * 0.1);
      renderWidth(currentPit, screenWidth * 0.2);
      renderLeft(currentPit, screenWidth * 0.4)
      initPlayer();
    }, ANIM_DURATION);
  };
  var initPlayer = function () {
    renderLeft(player, screenWidth * 0.2);
    renderTop(player, -player.clientHeight);
  };
  var setWalkMaxVal = function () {
    WALK_THROUGH_MAX_WIDTH = currentPitEdge * 0.2;
    if (WALK_THROUGH_MAX_WIDTH < WALK_THROUGH_MAX_WIDTH_MIN_THRESHOLD) {
      WALK_THROUGH_MAX_WIDTH = WALK_THROUGH_MAX_WIDTH_MIN_THRESHOLD;
    } else if (WALK_THROUGH_MAX_WIDTH > WALK_THROUGH_MAX_WIDTH_MAX_THRESHOLD) {
      WALK_THROUGH_MAX_WIDTH = WALK_THROUGH_MAX_WIDTH_MAX_THRESHOLD;
    }
    WALK_THROUGH_MAX_HEIGHT = currentPitEdge * 0.3;
    if (WALK_THROUGH_MAX_HEIGHT < WALK_THROUGH_MAX_HEIGHT_MIN_THRESHOLD) {
      WALK_THROUGH_MAX_HEIGHT = WALK_THROUGH_MAX_HEIGHT_MIN_THRESHOLD;
    } else if (WALK_THROUGH_MAX_HEIGHT > WALK_THROUGH_MAX_HEIGHT_MAX_THRESHOLD) {
      WALK_THROUGH_MAX_HEIGHT = WALK_THROUGH_MAX_HEIGHT_MAX_THRESHOLD;
    }
  };

  listen(document.querySelector('#nav-about'), 'click', openAbout);
  listen(document.querySelector('#close-about'), 'click', closeAbout);
  listen(document.querySelector('#nav-intro'), 'click', openIntro);
  listen(document.querySelector('#close-intro'), 'click', closeIntro);
  listen(document.querySelector('#nav-start'), 'click', startGame);
  listen(document.querySelector('#replay'), 'click', replay);
  listen(document.querySelector('#home'), 'click', goHome);
  listen(mainContainer, touchStart, startEnlargement);
  listen(mainContainer, touchEnd, stopEnlargementAndStartFallDown);
};