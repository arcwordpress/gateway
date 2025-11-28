<?php

namespace Gateway\REST;

class RequestLog
{
    /**
     * Log an API request to a daily JSONL file.
     *
     * @param string $route   The full route (e.g., /gateway/v1/posts)
     * @param string $method  HTTP method (GET, POST, etc.)
     * @param int    $user    User ID (0 for guest)
     * @param int    $status  HTTP response status code
     * @param int    $ms      Response time in milliseconds
     */
    public static function log($route, $method, $user, $status, $ms)
    {
        $dir = defined('GATEWAY_REQUEST_LOG_DIR') ? GATEWAY_REQUEST_LOG_DIR : (WP_CONTENT_DIR . '/gateway/requests/logs');
        if (!is_dir($dir)) {
            error_log("RequestLog error: Log directory does not exist: $dir");
            return;
        }

        $file = $dir . '/' . date('Y-m-d') . '.log';
        $entry = [
            'ts'     => time(),
            'route'  => $route,
            'method' => $method,
            'user'   => $user,
            'status' => $status,
            'ms'     => $ms,
        ];

        // Append as JSONL
        file_put_contents($file, json_encode($entry) . "\n", FILE_APPEND | LOCK_EX);
    }

    /**
     * Get last 8 weeks of request totals, grouped by week (ending Sunday).
     * @return array Array of ['week' => 'YYYY-MM-DD', 'total' => int]
     */
    public static function getWeeklyRequestTotals($weeks = 8)
    {
        $dir = defined('GATEWAY_REQUEST_LOG_DIR') ? GATEWAY_REQUEST_LOG_DIR : (WP_CONTENT_DIR . '/gateway/requests/logs');
        if (!is_dir($dir)) {
            return [];
        }

        $today = new \DateTimeImmutable('today');
        // Find the most recent Sunday (this week or last week)
        $lastSunday = $today->modify('last sunday');
        if ($today->format('w') == 0) { // today is Sunday
            $lastSunday = $today;
        }

        // Build week ranges (Sun-Sat), newest last
        $weeksArr = [];
        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekEnd = $lastSunday->modify("-$i weeks");
            $weekStart = $weekEnd->modify('-6 days');
            $weeksArr[] = [
                'start' => $weekStart,
                'end' => $weekEnd,
                'label' => $weekEnd->format('Y-m-d'),
                'total' => 0,
            ];
        }

        // Map: date string => week index
        $dateToWeek = [];
        foreach ($weeksArr as $idx => $w) {
            $period = new \DatePeriod($w['start'], new \DateInterval('P1D'), $w['end']->modify('+1 day'));
            foreach ($period as $d) {
                $dateToWeek[$d->format('Y-m-d')] = $idx;
            }
        }

        // Scan log files for relevant days
        foreach ($dateToWeek as $dateStr => $weekIdx) {
            $file = $dir . '/' . $dateStr . '.log';
            if (file_exists($file)) {
                $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $weeksArr[$weekIdx]['total'] += count($lines);
            }
        }

        // Return array for chart: [ ['week' => 'YYYY-MM-DD', 'total' => N], ... ]
        return array_map(function($w) {
            return [
                'week' => $w['label'],
                'total' => $w['total'],
            ];
        }, $weeksArr);
    }
}