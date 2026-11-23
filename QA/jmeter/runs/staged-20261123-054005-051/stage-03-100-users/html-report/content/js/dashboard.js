/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9979238754325259, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "C4. Booking User - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "C5. Booking User - Delete Created Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D5. Admin - Delete Own Booking"], "isController": false}, {"data": [0.9875, 500, 1500, "B4. Client - Browse Gallery"], "isController": false}, {"data": [1.0, 500, 1500, "B2. Client - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "D9. Admin - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D8. Admin - Delete Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "D3. Admin - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D4. Admin - Update Own Booking Status"], "isController": false}, {"data": [1.0, 500, 1500, "C6. Booking User - Sign Out"], "isController": false}, {"data": [0.967391304347826, 500, 1500, "B1. Client - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "A2. Visitor - Filter Gallery by Category"], "isController": false}, {"data": [1.0, 500, 1500, "B5. Client - Refresh Session Token"], "isController": false}, {"data": [0.9987179487179487, 500, 1500, "A1. Visitor - Browse Gallery (Page 1)"], "isController": false}, {"data": [1.0, 500, 1500, "A3. Visitor - View Team Roster"], "isController": false}, {"data": [0.96875, 500, 1500, "C1. Booking User - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D6. Admin - Create Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "C3. Booking User - Read Personal Records"], "isController": false}, {"data": [1.0, 500, 1500, "D1. Admin - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D2. Admin - List All Platform Bookings"], "isController": false}, {"data": [1.0, 500, 1500, "B3. Client - View Booking Records"], "isController": false}, {"data": [1.0, 500, 1500, "C2. Booking User - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "B6. Client - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D7. Admin - Update Temporary Team Member"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1445, 0, 0.0, 132.1723183390999, 91, 887, 103.0, 211.0, 276.70000000000005, 438.6999999999998, 5.0865774198204035, 3.1285434985972307, 1.3742985605337914], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["C4. Booking User - Create Temporary Booking", 16, 0, 0.0, 205.6875, 188, 238, 197.0, 236.6, 238.0, 238.0, 0.08210686208099842, 0.05322112276002217, 0.06893688933021327], "isController": false}, {"data": ["C5. Booking User - Delete Created Booking", 15, 0, 0.0, 206.5333333333333, 194, 232, 204.0, 230.8, 232.0, 232.0, 0.08762654733878175, 0.05646093352942207, 0.05510888328728071], "isController": false}, {"data": ["D5. Admin - Delete Own Booking", 2, 0, 0.0, 250.5, 190, 311, 250.5, 311.0, 311.0, 311.0, 0.07353211515129232, 0.04804002444942829, 0.04624480679436744], "isController": false}, {"data": ["B4. Client - Browse Gallery", 40, 0, 0.0, 135.75, 92, 887, 101.0, 124.0, 450.7999999999994, 887.0, 0.20529981471691722, 0.0799947520234863, 0.08139816872565273], "isController": false}, {"data": ["B2. Client - View Own Profile", 41, 0, 0.0, 206.56097560975607, 185, 306, 198.0, 247.60000000000005, 264.8, 306.0, 0.16054004103560074, 0.24624756008504706, 0.09610453628400707], "isController": false}, {"data": ["D9. Admin - Sign Out", 1, 0, 0.0, 103.0, 103, 103, 103.0, 103.0, 103.0, 103.0, 9.70873786407767, 4.380309466019417, 3.9631371359223304], "isController": false}, {"data": ["D8. Admin - Delete Temporary Team Member", 2, 0, 0.0, 290.5, 290, 291, 290.5, 291.0, 291.0, 291.0, 0.10231225700838961, 0.060847816912216086, 0.06364541768978925], "isController": false}, {"data": ["D3. Admin - Create Temporary Booking", 2, 0, 0.0, 195.0, 189, 201, 195.0, 201.0, 201.0, 201.0, 0.05304054950009282, 0.03475606319781473, 0.04278466199909831], "isController": false}, {"data": ["D4. Admin - Update Own Booking Status", 2, 0, 0.0, 343.0, 207, 479, 343.0, 479.0, 479.0, 479.0, 0.06200589055960316, 0.036513234382266314, 0.04050970779724074], "isController": false}, {"data": ["C6. Booking User - Sign Out", 11, 0, 0.0, 109.54545454545455, 97, 159, 100.0, 152.40000000000003, 159.0, 159.0, 0.07193209610128039, 0.032453738670694864, 0.02936290641634297], "isController": false}, {"data": ["B1. Client - Sign In", 46, 0, 0.0, 342.97826086956525, 255, 693, 308.5, 471.70000000000005, 520.95, 693.0, 0.16713051439865714, 0.358633046108039, 0.047608637105154165], "isController": false}, {"data": ["A2. Visitor - Filter Gallery by Category", 370, 0, 0.0, 108.31621621621628, 91, 359, 102.0, 117.0, 142.69999999999993, 246.8000000000004, 1.387966703804154, 0.540819057439314, 0.30497315269134245], "isController": false}, {"data": ["B5. Client - Refresh Session Token", 39, 0, 0.0, 108.71794871794872, 94, 165, 102.0, 136.0, 148.0, 165.0, 0.20726600199825684, 0.3710298097670118, 0.08440422151686827], "isController": false}, {"data": ["A1. Visitor - Browse Gallery (Page 1)", 390, 0, 0.0, 113.45641025641031, 92, 861, 102.0, 124.90000000000003, 167.45, 433.2699999999999, 1.3848497438027974, 0.5396045388450352, 0.27994521188201077], "isController": false}, {"data": ["A3. Visitor - View Team Roster", 340, 0, 0.0, 107.16470588235295, 91, 435, 99.0, 121.0, 137.84999999999997, 257.25999999999965, 1.35160921002417, 0.6208838344060075, 0.2521067960103676], "isController": false}, {"data": ["C1. Booking User - Sign In", 16, 0, 0.0, 318.5, 259, 567, 291.0, 431.90000000000015, 567.0, 567.0, 0.0798817749730399, 0.1697390206244758, 0.02275928500818788], "isController": false}, {"data": ["D6. Admin - Create Temporary Team Member", 2, 0, 0.0, 349.0, 286, 412, 349.0, 412.0, 412.0, 412.0, 0.09360666479453338, 0.05539613170457737, 0.06307480342600394], "isController": false}, {"data": ["C3. Booking User - Read Personal Records", 16, 0, 0.0, 209.625, 186, 277, 203.5, 268.6, 277.0, 277.0, 0.08003281345351594, 0.06441117420642463, 0.0467379125441431], "isController": false}, {"data": ["D1. Admin - Sign In", 2, 0, 0.0, 326.0, 275, 377, 326.0, 377.0, 377.0, 377.0, 0.05353319057815845, 0.27532475408190576, 0.015160766862955033], "isController": false}, {"data": ["D2. Admin - List All Platform Bookings", 2, 0, 0.0, 291.0, 289, 293, 291.0, 293.0, 293.0, 293.0, 0.05085435313262815, 0.8757725491380186, 0.029499497813262814], "isController": false}, {"data": ["B3. Client - View Booking Records", 40, 0, 0.0, 208.37499999999997, 185, 316, 204.0, 239.89999999999998, 262.24999999999994, 316.0, 0.20980965019486073, 0.1359716104595356, 0.12252555743801435], "isController": false}, {"data": ["C2. Booking User - View Own Profile", 16, 0, 0.0, 220.6875, 190, 385, 206.5, 308.00000000000006, 385.0, 385.0, 0.08080155138978669, 0.12505894410047674, 0.04837045996283129], "isController": false}, {"data": ["B6. Client - Sign Out", 32, 0, 0.0, 111.06249999999999, 96, 204, 104.5, 128.79999999999998, 176.6999999999999, 204.0, 0.18820208198553195, 0.08491148620831618, 0.07682467799800036], "isController": false}, {"data": ["D7. Admin - Update Temporary Team Member", 2, 0, 0.0, 327.5, 317, 338, 327.5, 338.0, 338.0, 338.0, 0.09728099615740066, 0.05348554769200836, 0.06346064983705432], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1445, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
