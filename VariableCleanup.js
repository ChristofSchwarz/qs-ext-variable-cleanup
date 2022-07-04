/*globals define*/
define( ["qlik", "jquery", "text!./style.css", "./leonardo", "./props"]
  ,function (qlik, $, cssContent, leonardo, props) {
	'use strict';
	
   $("<style>").html(cssContent).appendTo("head");

	function sortTable(table, order) {
		var asc   = order === 'asc',
			tbody = table.find('tbody');

		tbody.find('tr').sort(function(a, b) {
			if (asc) {
				return $('td:first', a).text().localeCompare($('td:first', b).text());
			} else {
				return $('td:first', b).text().localeCompare($('td:first', a).text());
			}
		}).appendTo(tbody);
	}

	return {
		initialProperties: {
		    title: "Variables",
			qHyperCubeDef: {
				qDimensions: [],
				//qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 1,
					qHeight: 10000
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 0, max: 1
				}, 
				/* 
				measures: {
					uses: "measures",
					min: 0
				},
				sorting: {
					uses: "sorting"
				}, 
				*/
				settings: {
					uses: "settings",
					items: {
                        item1: props.customProps()
                    }
				}
			}
		},
		snapshot: {
			canTakeSnapshot: false
		},
		
		paint: async function ( $element, layout ) {
			
			var self = this;
			//var html = "";
			var ownId = this.options.id;
			var app = qlik.currApp();
            var enigma = app.model.enigmaModel;
			var datapage = null;
			var keepVars = [];
			if (layout.qHyperCube && layout.qHyperCube.qSize.qcx) {
				datapage = layout.qHyperCube.qDataPages[0].qMatrix;
				datapage.forEach(datarow => {
					keepVars.push(datarow[0].qText);
				})
			} 
			console.log('keepVars', keepVars);
			
			// console.log(ownId, layout, datapage);
					
			$element.html(`
			<div style="float:left;" id="${ownId}_counter"></div>
			<div style="float:right;"><u>Legend:</u> 
				<span style="color:red;${layout.pShowSysVar ? '' : 'display:none;'}">&block; system var</span> 
				<span style="color:black;">&block; not from script</span> 
				<span style="color:blue;">&block; from script</span>
				<span style="color:green;${datapage ? '' : 'display:none;'}">&block; from script but excepted</span>
				 
			</div>
			<table id="${ownId}_table">
				<thead id="${ownId}_thead">
					<tr>
						<th>
							<button id="${ownId}_del" class="lui-button" style="color:blue;width: auto;">
								<span class="lui-icon  lui-icon--remove" style="color:red;"></span> Delete all blue
							</button>
							<button id="${ownId}_save" class="lui-button" style="width: auto;">
								<span class="lui-icon  lui-icon--save"></span> save app
							</button>
						</th>
						<th>Script</th>
						<th>Config</th>
						<th>Reserved</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody id="${ownId}_tbody"></tbody>
			</table>`);
			
			const sObj = await enigma.createSessionObject({
				qInfo: { qType: "VariableList" },
				qVariableListDef: {
					qType: "variable",
					qShowReserved: true,
					qShowConfig: true,
					qData: {tags: "/tags"}
				}
			});
			const sLayout = await sObj.getLayout();
			var varList = sLayout.qVariableList.qItems;
			var counter = varList.length;
			
			async function removeVar(varId, varName) {
			
				const ret = await enigma.destroyVariableById(varId);
				if (ret) {
					// remove the item from varList array
					varList = varList.filter(function(value, index, arr){ 
						return value.qInfo.qId != varId;
					});
					// visually delete the var
					$(`#${ownId}_tr_${varId}`).remove();
				} else {
					$(`#${ownId}_tr_${varId}`).css('background', 'pink');
				}
				console.log('deleted var ', varName, ret);
				counter--;
				$(`#${ownId}_counter`).text(counter + ' variables');
			}
			
			// fill table with variable data

			varList.forEach(function(variable) {
				//console.log(variable);
				$(`#${ownId}_tr_${variable.qInfo.qId}`).remove(); // remove the row from html if it already exists
				
				if (!layout.pShowSysVar && (variable.qIsConfig || variable.qIsReserved)) {
					// extension setting to not show system variables 
					counter--;
				} else {
					$(`#${ownId}_tbody`).append(
					`<tr id="${ownId}_tr_${variable.qInfo.qId}" style="color:${(variable.qIsConfig || variable.qIsReserved)? 'red' : (variable.qIsScriptCreated ? (keepVars.indexOf(variable.qName) > -1 ? 'green' : 'blue') : 'black')};">
						<td class="${ownId}_td"><a id="${ownId}_del_${variable.qInfo.qId}"><span class="lui-icon  lui-icon--remove"></a> ${variable.qName}</td>
						<td>${variable.qIsScriptCreated ? 'X' : ''}</td>
						<td>${variable.qIsConfig ? 'X' : ''}</td>
						<td>${variable.qIsReserved ? 'X' : ''}</td>
						<td ${variable.qDefinition ? '' : 'style="background:#e0e0e0;"'}>${variable.qDefinition || ''}</td>
					</tr>`);
					$(`#${ownId}_del_${variable.qInfo.qId}`).click(async function(){
						// alert(variable.qInfo.qId);
						removeVar(variable.qInfo.qId, variable.qName);
					})
				}
			});
			sortTable($(`#${ownId}_table`),'asc');
			$(`#${ownId}_counter`).text(counter + ' variables');
			
			// Handle "delete all" click on button
			
			$(`#${ownId}_del`).click(async function(){
			
				
				leonardo.msg(ownId, 'Confirm', 'Do you want to delete all non-scripted variables at once?', 'Yes', 'No');
				
				
				$('#msgok_' + ownId).on('click', function () {
					$(`#${ownId}_thead .lui-button`).prop('disabled', true); // disable button while working
					varList.forEach(function(variable) {
					
					    const keepVar = datapage ? datapage.filter(function(val,i,a) { return val[0].qText == variable.qName }) : [];
				        
						if (variable.qIsScriptCreated && !variable.qIsConfig && !variable.qIsReserved && keepVar.length == 0) {
							removeVar(variable.qInfo.qId, variable.qName);
						}
					});
					$('#msgparent_' + ownId).remove();
					$(`#${ownId}_thead .lui-button`).prop('disabled', false);  // enable buttons again
				});
				
			});

			$(`#${ownId}_save`).click(async function(){
				$(`#${ownId}_thead .lui-button`).prop('disabled', true); // disable button while working
				app.doSave().then(()=>{
					leonardo.msg(ownId, 'Response', 'Save done.', null, 'OK');
				});
				$(`#${ownId}_thead .lui-button`).prop('disabled', false);  // enable buttons again
			});
			
			return qlik.Promise.resolve();
		}
	};
} );
