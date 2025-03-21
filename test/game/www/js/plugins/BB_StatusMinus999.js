//=============================================================================
// BB_StatusMinus999.jp
// Copyright (c) 2016 BB ENTERTAINMENT
//=============================================================================

/*:
 * @plugindesc HPとMP以外のステータスの下限を-999にします。
 * @author ビービー
 * 
 * @help プラグインの説明
 * HPとMP以外のステータスの下限を-999にします。
 * HPの下限は1、MPの下限は0です。
 * 
 * 利用規約：
 * このプラグインは、MITライセンスのもとで公開されています。
 * Copyright (c) 2016 BB ENTERTAINMENT
 * Released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * 
 * コンタクト：
 * BB ENTERTAINMENT Twitter: https://twitter.com/BB_ENTER/
 * BB ENTERTAINMENT BLOG   : http://bb-entertainment-blog.blogspot.jp/
 */


(function() {

var _Game_BattlerBase_prototype_paramMin = Game_BattlerBase.prototype.paramMin;
Game_BattlerBase.prototype.paramMin = function(paramId) {
    if (paramId === 0) {
        return 1;  // MHP
    } else if (paramId === 1) {
        return 0;    // MMP
    } else {
        return -999;
    }
};

})();
