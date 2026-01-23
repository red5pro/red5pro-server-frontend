<%@ page import="
    com.red5pro.cluster.ClusterAgent,
    com.red5pro.cluster.ClusterConfiguration,
    com.red5pro.cluster.plugin.mbr.MIRVFactory,
    com.red5pro.cluster.plugin.mbr.MIRVSideStream,
    com.red5pro.cluster.streams.Provision,
    com.red5pro.plugin.Red5ProPlugin,
    java.util.Map,
    java.util.Optional
" %>
<%
    // Handle AJAX status request
    String statusRequest = request.getParameter("getStatus");
    if (statusRequest != null) {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        StringBuilder json = new StringBuilder();
        json.append("{\"streams\":[");

        Map<Integer, MIRVSideStream> procs = MIRVFactory.getProcessors();
        boolean first = true;
        for (Map.Entry<Integer, MIRVSideStream> entry : procs.entrySet()) {
            if (!first) json.append(",");
            first = false;

            MIRVSideStream stream = entry.getValue();
            Provision prov = stream.getProvision();
            Map<String, Object> status = stream.getProcessingStatus();

            json.append("{");
            json.append("\"nativeId\":").append(entry.getKey()).append(",");
            json.append("\"streamName\":\"").append(prov != null ? prov.getStreamName() : "Unknown").append("\",");
            json.append("\"contextPath\":\"").append(prov != null ? prov.getContextPath() : "").append("\",");

            // Status fields
            for (Map.Entry<String, Object> s : status.entrySet()) {
                json.append("\"").append(s.getKey()).append("\":");
                Object val = s.getValue();
                if (val instanceof String) {
                    json.append("\"").append(val).append("\"");
                } else if (val instanceof Boolean) {
                    json.append(val);
                } else {
                    json.append(val);
                }
                json.append(",");
            }
            // Remove trailing comma and close
            json.setLength(json.length() - 1);
            json.append("}");
        }

        json.append("]}");
        out.print(json.toString());
        return;
    }

    String message = null;
    String messageType = "info";

    // Get cluster configuration
    Optional<ClusterAgent<?>> clusterOpt = Optional.ofNullable(Red5ProPlugin.getCluster());
    ClusterConfiguration clusterConfig = null;
    if (clusterOpt.isPresent()) {
        clusterConfig = (ClusterConfiguration) clusterOpt.get().getConfiguration();
    }

    // Handle form submissions
    String action = request.getParameter("action");

    if ("updateGlobal".equals(action) && clusterConfig != null) {
        try {
            int target = Integer.parseInt(request.getParameter("globalTarget"));
            int min = Integer.parseInt(request.getParameter("globalMin"));
            int max = Integer.parseInt(request.getParameter("globalMax"));
            clusterConfig.setReorderBufferTarget(target);
            clusterConfig.setReorderBufferMin(min);
            clusterConfig.setReorderBufferMax(max);
            message = "Global defaults updated successfully. New streams will use: target=" + target + ", min=" + min + ", max=" + max;
            messageType = "success";
        } catch (NumberFormatException e) {
            message = "Invalid number format: " + e.getMessage();
            messageType = "error";
        }
    } else if ("updateStream".equals(action)) {
        try {
            int nativeId = Integer.parseInt(request.getParameter("nativeId"));
            int target = Integer.parseInt(request.getParameter("target"));
            int min = Integer.parseInt(request.getParameter("min"));
            int max = Integer.parseInt(request.getParameter("max"));

            MIRVSideStream stream = MIRVFactory.getProcessors().get(nativeId);
            if (stream != null) {
                int result = stream.updateReorderBufferSizes(target, min, max);
                if (result == 0) {
                    message = "Stream " + stream.getProvision().getStreamName() + " updated successfully.";
                    messageType = "success";
                } else {
                    message = "Failed to update stream. Error code: " + result;
                    messageType = "error";
                }
            } else {
                message = "Stream not found with nativeId: " + nativeId;
                messageType = "error";
            }
        } catch (NumberFormatException e) {
            message = "Invalid number format: " + e.getMessage();
            messageType = "error";
        }
    }

    // Get all active processors
    Map<Integer, MIRVSideStream> activeProcessors = MIRVFactory.getProcessors();
%>
<!DOCTYPE html>
<html>
<head>
    <title>Transcoder Stats & Reorder Buffer Settings</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        h1, h2, h3 {
            color: #333;
        }
        .container {
            max-width: 1600px;
            margin: 0 auto;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .message {
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .message.success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .message.error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .message.info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th { background-color: #f8f9fa; font-weight: 600; font-size: 0.85em; }
        tr:hover { background-color: #f5f5f5; }
        input[type="number"] {
            width: 60px;
            padding: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        button {
            background-color: #007bff;
            color: white;
            padding: 5px 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.85em;
        }
        button:hover { background-color: #0056b3; }
        button.expand-btn {
            background-color: #6c757d;
            padding: 3px 8px;
            font-size: 0.8em;
        }
        button.expand-btn:hover { background-color: #545b62; }
        .no-streams {
            color: #666;
            font-style: italic;
            padding: 20px;
            text-align: center;
        }
        .stream-name { font-weight: 600; color: #333; }
        .stream-context { font-size: 0.8em; color: #666; }
        .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        .controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .form-row {
            display: flex;
            gap: 15px;
            align-items: center;
            margin-top: 15px;
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .form-group label { font-size: 0.85em; color: #666; }
        .status-good { color: #155724; font-weight: 600; }
        .status-warn { color: #856404; font-weight: 600; }
        .status-bad { color: #721c24; font-weight: 600; }
        #lastUpdate { font-size: 0.85em; color: #999; }
        .metric-cell {
            font-family: monospace;
            font-size: 0.85em;
            text-align: right;
        }
        .details-row {
            display: none;
            background-color: #f8f9fa;
        }
        .details-row.expanded { display: table-row; }
        .details-content {
            padding: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
        }
        .stats-section {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
        }
        .stats-section h4 {
            margin: 0 0 10px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
            font-size: 0.9em;
            color: #495057;
        }
        .stat-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 0.85em;
        }
        .stat-label { color: #666; }
        .stat-value {
            font-family: monospace;
            font-weight: 600;
            color: #333;
        }
        .highlight { background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Transcoder Stats & Reorder Buffer Settings</h1>

        <% if (message != null) { %>
        <div class="message <%= messageType %>"><%= message %></div>
        <% } %>

        <!-- Global Defaults Section -->
        <div class="card">
            <h2>Global Defaults (for new streams)</h2>
            <% if (clusterConfig != null) { %>
            <form method="post">
                <input type="hidden" name="action" value="updateGlobal"/>
                <div class="form-row">
                    <div class="form-group">
                        <label>Target</label>
                        <input type="number" name="globalTarget" value="<%= clusterConfig.getReorderBufferTarget() %>" min="0"/>
                    </div>
                    <div class="form-group">
                        <label>Min</label>
                        <input type="number" name="globalMin" value="<%= clusterConfig.getReorderBufferMin() %>" min="0"/>
                    </div>
                    <div class="form-group">
                        <label>Max</label>
                        <input type="number" name="globalMax" value="<%= clusterConfig.getReorderBufferMax() %>" min="0"/>
                    </div>
                    <button type="submit">Update Defaults</button>
                </div>
                <p style="font-size: 0.85em; color: #666; margin-top: 10px;">
                    Set all values to 0 to disable the reorder buffer.
                </p>
            </form>
            <% } else { %>
            <p class="no-streams">Cluster configuration not available.</p>
            <% } %>
        </div>

        <!-- Active Streams Section -->
        <div class="card">
            <div class="header-row">
                <h2>Active Streams</h2>
                <div class="controls">
                    <label><input type="checkbox" id="autoRefresh" checked /> Auto-refresh</label>
                    <select id="refreshInterval">
                        <option value="1000">1s</option>
                        <option value="2000" selected>2s</option>
                        <option value="5000">5s</option>
                    </select>
                    <button onclick="refreshStatus()">Refresh Now</button>
                    <button onclick="expandAll()">Expand All</button>
                    <button onclick="collapseAll()">Collapse All</button>
                    <span id="lastUpdate"></span>
                </div>
            </div>

            <div id="streamsContainer">
                <% if (activeProcessors.isEmpty()) { %>
                <p class="no-streams">No active MIRV streams found.</p>
                <% } else { %>
                <table id="streamsTable">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Stream</th>
                            <th>ID</th>
                            <th>Target</th>
                            <th>Min</th>
                            <th>Max</th>
                            <th>Native Reorder Buf</th>
                            <th>Native Input Q</th>
                            <th>Native Output Q</th>
                            <th>Encoder Lag</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="streamsBody">
                        <% for (Map.Entry<Integer, MIRVSideStream> entry : activeProcessors.entrySet()) {
                            MIRVSideStream stream = entry.getValue();
                            Provision prov = stream.getProvision();
                            String streamName = prov != null ? prov.getStreamName() : "Unknown";
                            String contextPath = prov != null ? prov.getContextPath() : "";
                            Map<String, Object> status = stream.getProcessingStatus();
                        %>
                        <tr class="stream-row" data-native-id="<%= entry.getKey() %>">
                            <td>
                                <button class="expand-btn" onclick="toggleDetails(<%= entry.getKey() %>)">+</button>
                            </td>
                            <td>
                                <div class="stream-name"><%= streamName %></div>
                                <div class="stream-context"><%= contextPath %></div>
                            </td>
                            <td><%= entry.getKey() %></td>
                            <form method="post" style="display: contents;">
                                <input type="hidden" name="action" value="updateStream"/>
                                <input type="hidden" name="nativeId" value="<%= entry.getKey() %>"/>
                                <td><input type="number" name="target" value="<%= stream.getReorderBufferTarget() %>" min="0" class="target-input"/></td>
                                <td><input type="number" name="min" value="<%= stream.getReorderBufferMin() %>" min="0" class="min-input"/></td>
                                <td><input type="number" name="max" value="<%= stream.getReorderBufferMax() %>" min="0" class="max-input"/></td>
                                <td class="metric-cell native-reorder-size"><%= status.get("nativeReorderBufSize") != null ? status.get("nativeReorderBufSize") : "-" %></td>
                                <td class="metric-cell native-input-q"><%= status.get("nativeInputQueueSize") != null ? status.get("nativeInputQueueSize") : "-" %></td>
                                <td class="metric-cell native-output-q"><%= status.get("nativeOutputQueueSize") != null ? status.get("nativeOutputQueueSize") : "-" %></td>
                                <td class="metric-cell encoder-lag"><%= status.get("encoderLagMs") != null ? status.get("encoderLagMs") + "ms" : "-" %></td>
                                <td class="running-status">
                                    <% if ((Boolean)status.get("isRunning")) { %>
                                        <span class="status-good">Running</span>
                                    <% } else { %>
                                        <span class="status-bad">Stopped</span>
                                    <% } %>
                                </td>
                                <td><button type="submit">Update</button></td>
                            </form>
                        </tr>
                        <tr class="details-row" id="details-<%= entry.getKey() %>">
                            <td colspan="12">
                                <div class="details-content">
                                    <div class="stats-grid">
                                        <div class="stats-section">
                                            <h4>Native Input Queue</h4>
                                            <div class="stat-row"><span class="stat-label">Current Size:</span><span class="stat-value native-input-q-size"><%= status.get("nativeInputQueueSize") != null ? status.get("nativeInputQueueSize") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Pushed:</span><span class="stat-value native-input-q-pushed"><%= status.get("nativeInputQueuePushed") != null ? status.get("nativeInputQueuePushed") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Popped:</span><span class="stat-value native-input-q-popped"><%= status.get("nativeInputQueuePopped") != null ? status.get("nativeInputQueuePopped") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Max Depth:</span><span class="stat-value native-input-q-max"><%= status.get("nativeInputQueueMaxDepth") != null ? status.get("nativeInputQueueMaxDepth") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Limit:</span><span class="stat-value native-input-q-limit"><%= status.get("nativeInputQueueLimit") != null ? status.get("nativeInputQueueLimit") : "-" %></span></div>
                                        </div>
                                        <div class="stats-section">
                                            <h4>Native Reorder Buffer</h4>
                                            <div class="stat-row"><span class="stat-label">Current Size:</span><span class="stat-value native-reorder-size-detail"><%= status.get("nativeReorderBufSize") != null ? status.get("nativeReorderBufSize") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Config (T/Min/Max):</span><span class="stat-value native-reorder-config"><%= status.get("nativeReorderBufTarget") %>/<%= status.get("nativeReorderBufMin") %>/<%= status.get("nativeReorderBufMax") %></span></div>
                                            <div class="stat-row"><span class="stat-label">Received:</span><span class="stat-value native-reorder-received"><%= status.get("nativeReorderBufReceived") != null ? status.get("nativeReorderBufReceived") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Sent:</span><span class="stat-value native-reorder-sent"><%= status.get("nativeReorderBufSent") != null ? status.get("nativeReorderBufSent") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Reordered:</span><span class="stat-value native-reorder-reordered"><%= status.get("nativeReorderBufReordered") != null ? status.get("nativeReorderBufReordered") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">In Order:</span><span class="stat-value native-reorder-inorder"><%= status.get("nativeReorderBufInOrder") != null ? status.get("nativeReorderBufInOrder") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Max PTS Delta:</span><span class="stat-value native-reorder-pts-delta"><%= status.get("nativeReorderBufMaxPtsDelta") != null ? status.get("nativeReorderBufMaxPtsDelta") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Max Depth:</span><span class="stat-value native-reorder-max-depth"><%= status.get("nativeReorderBufMaxDepth") != null ? status.get("nativeReorderBufMaxDepth") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Initial Fill:</span><span class="stat-value native-reorder-initial"><%= status.get("nativeReorderBufInitialFill") != null ? (((Number)status.get("nativeReorderBufInitialFill")).intValue() == 1 ? "Yes" : "No") : "-" %></span></div>
                                        </div>
                                        <div class="stats-section">
                                            <h4>Native Decoder</h4>
                                            <div class="stat-row"><span class="stat-label">Packets In:</span><span class="stat-value native-decoder-in"><%= status.get("nativeDecoderPacketsIn") != null ? status.get("nativeDecoderPacketsIn") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Frames Out:</span><span class="stat-value native-decoder-out"><%= status.get("nativeDecoderFramesOut") != null ? status.get("nativeDecoderFramesOut") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Dual Thread Mode:</span><span class="stat-value native-dual-thread"><%= status.get("nativeDualThreadMode") != null ? (((Number)status.get("nativeDualThreadMode")).intValue() == 1 ? "Yes" : "No") : "-" %></span></div>
                                            <div class="stat-row"><span class="stat-label">Using Thread:</span><span class="stat-value native-using-thread"><%= status.get("nativeUsingThread") != null ? status.get("nativeUsingThread") : "-" %></span></div>
                                        </div>
                                        <div class="stats-section">
                                            <h4>Java-side Queues</h4>
                                            <div class="stat-row"><span class="stat-label">Video Input Q:</span><span class="stat-value java-video-input"><%= status.get("videoInputQueueSize") %></span></div>
                                            <div class="stat-row"><span class="stat-label">Encoded Output Q:</span><span class="stat-value java-encoded-output"><%= status.get("encodedVideoOutputQueueSize") %></span></div>
                                            <div class="stat-row"><span class="stat-label">Encoder Lag:</span><span class="stat-value java-encoder-lag"><%= status.get("encoderLagMs") %>ms</span></div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <% } %>
                    </tbody>
                </table>
                <% } %>
            </div>
        </div>

        <div class="card">
            <h2>Legend</h2>
            <ul style="font-size: 0.9em;">
                <li><strong>Native Reorder Buf:</strong> Current frames in the native reorder buffer</li>
                <li><strong>Native Input Q:</strong> Frames waiting to enter the decoder</li>
                <li><strong>Native Output Q:</strong> Encoded frames waiting for Java callback</li>
                <li><strong>Reordered:</strong> Frames that arrived out of order and were reordered</li>
                <li><strong>Set values to 0:</strong> Disables the reorder buffer entirely</li>
            </ul>
        </div>
    </div>

    <script>
        let pollingInterval = null;

        function toggleDetails(nativeId) {
            const row = document.getElementById('details-' + nativeId);
            const btn = document.querySelector('tr[data-native-id="' + nativeId + '"] .expand-btn');
            if (row.classList.contains('expanded')) {
                row.classList.remove('expanded');
                btn.textContent = '+';
            } else {
                row.classList.add('expanded');
                btn.textContent = '-';
            }
        }

        function expandAll() {
            document.querySelectorAll('.details-row').forEach(row => row.classList.add('expanded'));
            document.querySelectorAll('.expand-btn').forEach(btn => btn.textContent = '-');
        }

        function collapseAll() {
            document.querySelectorAll('.details-row').forEach(row => row.classList.remove('expanded'));
            document.querySelectorAll('.expand-btn').forEach(btn => btn.textContent = '+');
        }

        function refreshStatus() {
            fetch('transcoder.jsp?getStatus=1')
                .then(response => response.json())
                .then(data => {
                    updateTable(data.streams);
                    document.getElementById('lastUpdate').textContent = 'Updated: ' + new Date().toLocaleTimeString();
                })
                .catch(err => {
                    console.error('Error fetching status:', err);
                    document.getElementById('lastUpdate').textContent = 'Error updating';
                });
        }

        function updateTable(streams) {
            streams.forEach(stream => {
                const row = document.querySelector('tr[data-native-id="' + stream.nativeId + '"]');
                const detailsRow = document.getElementById('details-' + stream.nativeId);
                if (row) {
                    // Update main row metrics
                    updateCell(row, '.native-reorder-size', stream.nativeReorderBufSize);
                    updateCell(row, '.native-input-q', stream.nativeInputQueueSize);
                    updateCell(row, '.native-output-q', stream.nativeOutputQueueSize);
                    updateCell(row, '.encoder-lag', stream.encoderLagMs != null ? stream.encoderLagMs + 'ms' : '-');

                    const runningStatus = row.querySelector('.running-status');
                    if (runningStatus) {
                        runningStatus.innerHTML = stream.isRunning
                            ? '<span class="status-good">Running</span>'
                            : '<span class="status-bad">Stopped</span>';
                    }
                }
                if (detailsRow) {
                    // Update detail row metrics
                    updateCell(detailsRow, '.native-input-q-size', stream.nativeInputQueueSize);
                    updateCell(detailsRow, '.native-input-q-pushed', stream.nativeInputQueuePushed);
                    updateCell(detailsRow, '.native-input-q-popped', stream.nativeInputQueuePopped);
                    updateCell(detailsRow, '.native-input-q-max', stream.nativeInputQueueMaxDepth);
                    updateCell(detailsRow, '.native-input-q-limit', stream.nativeInputQueueLimit);

                    updateCell(detailsRow, '.native-reorder-size-detail', stream.nativeReorderBufSize);
                    updateCell(detailsRow, '.native-reorder-config', stream.nativeReorderBufTarget + '/' + stream.nativeReorderBufMin + '/' + stream.nativeReorderBufMax);
                    updateCell(detailsRow, '.native-reorder-received', stream.nativeReorderBufReceived);
                    updateCell(detailsRow, '.native-reorder-sent', stream.nativeReorderBufSent);
                    updateCell(detailsRow, '.native-reorder-reordered', stream.nativeReorderBufReordered);
                    updateCell(detailsRow, '.native-reorder-inorder', stream.nativeReorderBufInOrder);
                    updateCell(detailsRow, '.native-reorder-pts-delta', stream.nativeReorderBufMaxPtsDelta);
                    updateCell(detailsRow, '.native-reorder-max-depth', stream.nativeReorderBufMaxDepth);
                    updateCell(detailsRow, '.native-reorder-initial', stream.nativeReorderBufInitialFill == 1 ? 'Yes' : 'No');

                    updateCell(detailsRow, '.native-decoder-in', stream.nativeDecoderPacketsIn);
                    updateCell(detailsRow, '.native-decoder-out', stream.nativeDecoderFramesOut);
                    updateCell(detailsRow, '.native-dual-thread', stream.nativeDualThreadMode == 1 ? 'Yes' : 'No');
                    updateCell(detailsRow, '.native-using-thread', stream.nativeUsingThread);

                    updateCell(detailsRow, '.java-video-input', stream.videoInputQueueSize);
                    updateCell(detailsRow, '.java-encoded-output', stream.encodedVideoOutputQueueSize);
                    updateCell(detailsRow, '.java-encoder-lag', stream.encoderLagMs + 'ms');
                }
            });
        }

        function updateCell(container, selector, value) {
            const el = container.querySelector(selector);
            if (el) {
                const newVal = value !== undefined && value !== null ? value : '-';
                if (el.textContent !== String(newVal)) {
                    el.textContent = newVal;
                    el.classList.add('highlight');
                    setTimeout(() => el.classList.remove('highlight'), 500);
                }
            }
        }

        function startPolling() {
            const interval = parseInt(document.getElementById('refreshInterval').value);
            if (pollingInterval) clearInterval(pollingInterval);
            if (document.getElementById('autoRefresh').checked) {
                pollingInterval = setInterval(refreshStatus, interval);
            }
        }

        function stopPolling() {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
        }

        document.getElementById('autoRefresh').addEventListener('change', function() {
            this.checked ? startPolling() : stopPolling();
        });

        document.getElementById('refreshInterval').addEventListener('change', function() {
            if (document.getElementById('autoRefresh').checked) startPolling();
        });

        // Start polling on page load
        startPolling();
    </script>
</body>
</html>
