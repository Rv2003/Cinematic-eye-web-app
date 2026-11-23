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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9986206896551724, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "C4. Booking User - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "C5. Booking User - Delete Created Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D5. Admin - Delete Own Booking"], "isController": false}, {"data": [1.0, 500, 1500, "B4. Client - Browse Gallery"], "isController": false}, {"data": [1.0, 500, 1500, "B2. Client - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "D9. Admin - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D8. Admin - Delete Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "D3. Admin - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D4. Admin - Update Own Booking Status"], "isController": false}, {"data": [1.0, 500, 1500, "C6. Booking User - Sign Out"], "isController": false}, {"data": [0.9782608695652174, 500, 1500, "B1. Client - Sign In"], "isController": false}, {"data": [0.9972972972972973, 500, 1500, "A2. Visitor - Filter Gallery by Category"], "isController": false}, {"data": [1.0, 500, 1500, "B5. Client - Refresh Session Token"], "isController": false}, {"data": [1.0, 500, 1500, "A1. Visitor - Browse Gallery (Page 1)"], "isController": false}, {"data": [1.0, 500, 1500, "A3. Visitor - View Team Roster"], "isController": false}, {"data": [1.0, 500, 1500, "C1. Booking User - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D6. Admin - Create Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "C3. Booking User - Read Personal Records"], "isController": false}, {"data": [1.0, 500, 1500, "D1. Admin - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D2. Admin - List All Platform Bookings"], "isController": false}, {"data": [1.0, 500, 1500, "B3. Client - View Booking Records"], "isController": false}, {"data": [1.0, 500, 1500, "C2. Booking User - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "B6. Client - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D7. Admin - Update Temporary Team Member"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 725, 0, 0.0, 125.06758620689652, 93, 573, 103.0, 205.0, 274.0, 317.48, 2.56672602589384, 1.5582004573197714, 0.6942537531730044], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["C4. Booking User - Create Temporary Booking", 8, 0, 0.0, 197.375, 191, 216, 194.0, 216.0, 216.0, 216.0, 0.048580242415409654, 0.03148346032512327, 0.04078202234994778], "isController": false}, {"data": ["C5. Booking User - Delete Created Booking", 8, 0, 0.0, 203.125, 195, 217, 201.0, 217.0, 217.0, 217.0, 0.04782343587475042, 0.030806185438361566, 0.030076457718104754], "isController": false}, {"data": ["D5. Admin - Delete Own Booking", 1, 0, 0.0, 318.0, 318, 318, 318.0, 318.0, 318.0, 318.0, 3.1446540880503147, 2.054466391509434, 1.977692610062893], "isController": false}, {"data": ["B4. Client - Browse Gallery", 20, 0, 0.0, 100.6, 94, 108, 98.5, 107.0, 107.95, 108.0, 0.10696273952968482, 0.041677864328461184, 0.04240905493071489], "isController": false}, {"data": ["B2. Client - View Own Profile", 20, 0, 0.0, 214.1, 188, 466, 197.0, 238.90000000000006, 454.79999999999984, 466.0, 0.10654336048413303, 0.16583931862857385, 0.06378035153981791], "isController": false}, {"data": ["D9. Admin - Sign Out", 1, 0, 0.0, 108.0, 108, 108, 108.0, 108.0, 108.0, 108.0, 9.25925925925926, 4.177517361111111, 3.779658564814815], "isController": false}, {"data": ["D8. Admin - Delete Temporary Team Member", 1, 0, 0.0, 287.0, 287, 287, 287.0, 287.0, 287.0, 287.0, 3.484320557491289, 2.072217987804878, 2.1674923780487805], "isController": false}, {"data": ["D3. Admin - Create Temporary Booking", 1, 0, 0.0, 216.0, 216, 216, 216.0, 216.0, 216.0, 216.0, 4.62962962962963, 3.033673321759259, 3.734447337962963], "isController": false}, {"data": ["D4. Admin - Update Own Booking Status", 1, 0, 0.0, 202.0, 202, 202, 202.0, 202.0, 202.0, 202.0, 4.9504950495049505, 2.915184096534653, 3.234258972772277], "isController": false}, {"data": ["C6. Booking User - Sign Out", 7, 0, 0.0, 103.71428571428571, 99, 108, 103.0, 108.0, 108.0, 108.0, 0.045587162654996356, 0.020567645650984685, 0.01860882225565281], "isController": false}, {"data": ["B1. Client - Sign In", 23, 0, 0.0, 297.8695652173913, 261, 573, 286.0, 313.6, 521.5999999999992, 573.0, 0.08454110719444823, 0.1778766145513624, 0.02408588779189655], "isController": false}, {"data": ["A2. Visitor - Filter Gallery by Category", 185, 0, 0.0, 109.14054054054054, 94, 517, 100.0, 110.4, 131.89999999999992, 414.6599999999984, 0.6925648484031701, 0.2698568110477196, 0.15217489344796217], "isController": false}, {"data": ["B5. Client - Refresh Session Token", 20, 0, 0.0, 106.39999999999999, 96, 140, 100.0, 134.60000000000002, 139.8, 140.0, 0.10592378783465296, 0.19280405092286101, 0.043134980006885044], "isController": false}, {"data": ["A1. Visitor - Browse Gallery (Page 1)", 194, 0, 0.0, 103.86082474226806, 94, 204, 102.5, 111.0, 113.0, 183.10000000000025, 0.6890721678778708, 0.26849589353835007, 0.13929486206124927], "isController": false}, {"data": ["A3. Visitor - View Team Roster", 171, 0, 0.0, 102.14035087719299, 93, 215, 98.0, 109.80000000000001, 124.4, 174.68000000000006, 0.6836199073315237, 0.27468711771255183, 0.12751113505890724], "isController": false}, {"data": ["C1. Booking User - Sign In", 8, 0, 0.0, 303.625, 266, 381, 299.5, 381.0, 381.0, 381.0, 0.04787093994590584, 0.0996278875900572, 0.013633166857153114], "isController": false}, {"data": ["D6. Admin - Create Temporary Team Member", 1, 0, 0.0, 289.0, 289, 289, 289.0, 289.0, 289.0, 289.0, 3.4602076124567476, 2.0477400519031144, 2.331585207612457], "isController": false}, {"data": ["C3. Booking User - Read Personal Records", 8, 0, 0.0, 197.5, 190, 208, 194.5, 208.0, 208.0, 208.0, 0.048583782733323616, 0.03684112040275956, 0.028372169994655787], "isController": false}, {"data": ["D1. Admin - Sign In", 2, 0, 0.0, 285.5, 282, 289, 285.5, 289.0, 289.0, 289.0, 0.007393688008547104, 0.03608755143234221, 0.0020939155492955665], "isController": false}, {"data": ["D2. Admin - List All Platform Bookings", 1, 0, 0.0, 201.0, 201, 201, 201.0, 201.0, 201.0, 201.0, 4.975124378109452, 85.04839085820895, 2.885960820895522], "isController": false}, {"data": ["B3. Client - View Booking Records", 20, 0, 0.0, 199.90000000000003, 187, 223, 194.5, 215.5, 222.65, 223.0, 0.10706695431988393, 0.0753232752851996, 0.06252542840165097], "isController": false}, {"data": ["C2. Booking User - View Own Profile", 8, 0, 0.0, 206.5, 190, 258, 201.5, 258.0, 258.0, 258.0, 0.04850954425283174, 0.07295972836171141, 0.02903940490916588], "isController": false}, {"data": ["B6. Client - Sign Out", 15, 0, 0.0, 101.8, 98, 107, 101.0, 107.0, 107.0, 107.0, 0.09195458669478435, 0.0414873232939359, 0.03753614964689439], "isController": false}, {"data": ["D7. Admin - Update Temporary Team Member", 1, 0, 0.0, 287.0, 287, 287, 287.0, 287.0, 287.0, 287.0, 3.484320557491289, 1.9156957752613242, 2.2729747386759582], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 725, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
