/* === REST TIMER === */
var _restT = null, _restS = 0, _restTot = 90;

function startRest(s) {
  _restTot = s; _restS = s;
  clearInterval(_restT);
  var el = document.getElementById('rest-pop');
  if (el) el.style.display = 'flex';
  updRest();
  _restT = setInterval(function() {
    _restS--;
    updRest();
    if (_restS <= 0) {
      clearInterval(_restT);
      var el = document.getElementById('rest-pop');
      if (el) el.style.display = 'none';
    }
  }, 1000);
}

function updRest() {
  var m = Math.floor(_restS / 60), s = _restS % 60;
  var n = document.getElementById('rest-n');
  if (n) n.textContent = m + ':' + (s < 10 ? '0' : '') + s;
  var b = document.getElementById('rest-bar');
  if (b) b.style.width = Math.round(_restS / _restTot * 100) + '%';
}

function skipRest() {
  clearInterval(_restT);
  var el = document.getElementById('rest-pop');
  if (el) el.style.display = 'none';
}
