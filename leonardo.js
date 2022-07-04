// JavaScript
define([], function () {
    return {

        //=============================================================================================
        msg: function (ownId, title, detail, ok, close, inverse) {
            //=========================================================================================
			// This html was found on https://qlik-oss.github.io/leonardo-ui/dialog.html
			if (document.getElementById('msgparent_' + ownId)) document.getElementById('msgparent_' + ownId).remove();

			var node = document.createElement("div");
			node.id = "msgparent_" + ownId;
			var html =
				'  <div class="lui-modal-background"></div>' +
				'  <div class="lui-dialog' + (inverse ? '  lui-dialog--inverse' : '') + '" style="width: 400px;top:80px;">' +
				'    <div class="lui-dialog__header">' +
				'      <div class="lui-dialog__title">' + title + '</div>' +
				'    </div>' +
				'    <div class="lui-dialog__body">' +
				detail +
				'    </div>' +
				'    <div class="lui-dialog__footer">';
			if (close) {
				html +=
					'  <button class="lui-button  lui-dialog__button' + (inverse ? '  lui-button--inverse' : '') + '" ' +
					'   onclick="var elem=document.getElementById(\'msgparent_' + ownId + '\');elem.parentNode.removeChild(elem);">' +
					close +
					' </button>'
			}
			if (ok) {
				html +=
					'  <button class="lui-button  lui-dialog__button  ' + (inverse ? '  lui-button--inverse' : '') + '" id="msgok_' + ownId + '">' +
					ok +
					' </button>'
			};
			html +=
				'     </div>' +
				'  </div>';
			node.innerHTML = html;
			document.getElementById("qs-page-container").append(node);
		}
	}
})
