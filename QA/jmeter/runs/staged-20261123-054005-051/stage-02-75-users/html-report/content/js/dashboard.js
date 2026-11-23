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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9990850869167429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "C4. Booking User - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "C5. Booking User - Delete Created Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D5. Admin - Delete Own Booking"], "isController": false}, {"data": [1.0, 500, 1500, "B4. Client - Browse Gallery"], "isController": false}, {"data": [1.0, 500, 1500, "B2. Client - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "D9. Admin - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D8. Admin - Delete Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "D3. Admin - Create Temporary Booking"], "isController": false}, {"data": [1.0, 500, 1500, "D4. Admin - Update Own Booking Status"], "isController": false}, {"data": [1.0, 500, 1500, "C6. Booking User - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "B1. Client - Sign In"], "isController": false}, {"data": [0.9982394366197183, 500, 1500, "A2. Visitor - Filter Gallery by Category"], "isController": false}, {"data": [1.0, 500, 1500, "B5. Client - Refresh Session Token"], "isController": false}, {"data": [1.0, 500, 1500, "A1. Visitor - Browse Gallery (Page 1)"], "isController": false}, {"data": [1.0, 500, 1500, "A3. Visitor - View Team Roster"], "isController": false}, {"data": [1.0, 500, 1500, "C1. Booking User - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D6. Admin - Create Temporary Team Member"], "isController": false}, {"data": [1.0, 500, 1500, "C3. Booking User - Read Personal Records"], "isController": false}, {"data": [1.0, 500, 1500, "D1. Admin - Sign In"], "isController": false}, {"data": [1.0, 500, 1500, "D2. Admin - List All Platform Bookings"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "B3. Client - View Booking Records"], "isController": false}, {"data": [1.0, 500, 1500, "C2. Booking User - View Own Profile"], "isController": false}, {"data": [1.0, 500, 1500, "B6. Client - Sign Out"], "isController": false}, {"data": [1.0, 500, 1500, "D7. Admin - Update Temporary Team Member"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1093, 0, 0.0, 125.5489478499542, 92, 876, 102.0, 200.0, 269.0, 317.05999999999995, 3.8700539966362753, 2.282796317606444, 1.0396842081968665], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["C4. Booking User - Create Temporary Booking", 12, 0, 0.0, 202.83333333333334, 194, 219, 197.5, 217.5, 219.0, 219.0, 0.06367770590451528, 0.04127546610754103, 0.053463777003327155], "isController": false}, {"data": ["C5. Booking User - Delete Created Booking", 12, 0, 0.0, 200.58333333333331, 189, 212, 200.5, 211.7, 212.0, 212.0, 0.06435247998369736, 0.04146147330980893, 0.040471676864747175], "isController": false}, {"data": ["D5. Admin - Delete Own Booking", 1, 0, 0.0, 214.0, 214, 214, 214.0, 214.0, 214.0, 214.0, 4.672897196261682, 3.052898656542056, 2.9388142523364484], "isController": false}, {"data": ["B4. Client - Browse Gallery", 30, 0, 0.0, 100.89999999999999, 93, 113, 98.0, 112.9, 113.0, 113.0, 0.15241656463224423, 0.059388876258071724, 0.060430786367862456], "isController": false}, {"data": ["B2. Client - View Own Profile", 31, 0, 0.0, 200.74193548387098, 186, 274, 194.0, 212.0, 262.59999999999997, 274.0, 0.12780026879282338, 0.19149910488279479, 0.07650543434570385], "isController": false}, {"data": ["D9. Admin - Sign Out", 1, 0, 0.0, 168.0, 168, 168, 168.0, 168.0, 168.0, 168.0, 5.952380952380952, 2.685546875, 2.429780505952381], "isController": false}, {"data": ["D8. Admin - Delete Temporary Team Member", 1, 0, 0.0, 343.0, 343, 343, 343.0, 343.0, 343.0, 343.0, 2.9154518950437316, 1.7338966836734693, 1.8136160714285712], "isController": false}, {"data": ["D3. Admin - Create Temporary Booking", 1, 0, 0.0, 210.0, 210, 210, 210.0, 210.0, 210.0, 210.0, 4.761904761904763, 3.1203497023809526, 3.8411458333333335], "isController": false}, {"data": ["D4. Admin - Update Own Booking Status", 1, 0, 0.0, 196.0, 196, 196, 196.0, 196.0, 196.0, 196.0, 5.1020408163265305, 3.004424426020408, 3.333266900510204], "isController": false}, {"data": ["C6. Booking User - Sign Out", 9, 0, 0.0, 105.33333333333333, 100, 111, 106.0, 111.0, 111.0, 111.0, 0.05478284688194296, 0.02471647974556411, 0.022362529293605625], "isController": false}, {"data": ["B1. Client - Sign In", 34, 0, 0.0, 283.02941176470586, 265, 304, 284.0, 299.5, 301.0, 304.0, 0.12430626137950701, 0.25614958956083334, 0.03542528508178621], "isController": false}, {"data": ["A2. Visitor - Filter Gallery by Category", 284, 0, 0.0, 107.05985915492957, 93, 635, 100.0, 113.0, 147.75, 261.8999999999985, 1.0604810252312333, 0.4132147744797482, 0.23301585027053467], "isController": false}, {"data": ["B5. Client - Refresh Session Token", 29, 0, 0.0, 106.72413793103448, 94, 316, 100.0, 104.0, 211.0, 316.0, 0.15602050862685812, 0.2767451600017216, 0.06353569540761703], "isController": false}, {"data": ["A1. Visitor - Browse Gallery (Page 1)", 296, 0, 0.0, 108.73986486486483, 92, 408, 103.0, 112.30000000000001, 154.39999999999964, 317.05999999999995, 1.0480807022140706, 0.40838300799161537, 0.21186787632647713], "isController": false}, {"data": ["A3. Visitor - View Team Roster", 256, 0, 0.0, 102.75781250000001, 92, 441, 98.0, 111.0, 121.0, 172.30000000000007, 1.0058109154058015, 0.4169290058580628, 0.1876073094165118], "isController": false}, {"data": ["C1. Booking User - Sign In", 14, 0, 0.0, 284.2142857142857, 261, 327, 282.5, 316.5, 327.0, 327.0, 0.051857805896232526, 0.10727866555974945, 0.014776725522189584], "isController": false}, {"data": ["D6. Admin - Create Temporary Team Member", 1, 0, 0.0, 302.0, 302, 302, 302.0, 302.0, 302.0, 302.0, 3.3112582781456954, 1.9595923013245033, 2.2312189569536423], "isController": false}, {"data": ["C3. Booking User - Read Personal Records", 12, 0, 0.0, 197.16666666666669, 185, 221, 193.0, 217.10000000000002, 221.0, 221.0, 0.0627106686525045, 0.04694114015834444, 0.036622050638864936], "isController": false}, {"data": ["D1. Admin - Sign In", 1, 0, 0.0, 379.0, 379, 379, 379.0, 379.0, 379.0, 379.0, 2.638522427440633, 13.339483014511874, 0.7472377968337731], "isController": false}, {"data": ["D2. Admin - List All Platform Bookings", 1, 0, 0.0, 203.0, 203, 203, 203.0, 203.0, 203.0, 203.0, 4.926108374384237, 84.2104756773399, 2.857527709359606], "isController": false}, {"data": ["B3. Client - View Booking Records", 30, 0, 0.0, 223.23333333333332, 187, 876, 196.5, 227.70000000000002, 526.1999999999996, 876.0, 0.15394325651564833, 0.1057758547699318, 0.08990045644175557], "isController": false}, {"data": ["C2. Booking User - View Own Profile", 12, 0, 0.0, 196.58333333333334, 185, 235, 194.0, 224.20000000000005, 235.0, 235.0, 0.06386409720115593, 0.09698632144130623, 0.03823114412530136], "isController": false}, {"data": ["B6. Client - Sign Out", 23, 0, 0.0, 124.65217391304347, 100, 477, 106.0, 131.60000000000002, 409.199999999999, 477.0, 0.13871382132453605, 0.06258377485540592, 0.05662341534536726], "isController": false}, {"data": ["D7. Admin - Update Temporary Team Member", 1, 0, 0.0, 287.0, 287, 287, 287.0, 287.0, 287.0, 287.0, 3.484320557491289, 1.9156957752613242, 2.2729747386759582], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1093, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
