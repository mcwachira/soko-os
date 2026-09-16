<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class OutboxCleanupCommand extends Command
{
    protected $signature = 'outbox:cleanup 
                            {--days=30 : Delete outbox events older than this many days}
                            {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Clean up old processed outbox events';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');

        $cutoff = now()->subDays($days);

        $query = DB::table('outbox_events')
            ->where('status', 'published')
            ->where('created_at', '<', $cutoff);

        $count = $query->count();

        if ($dryRun) {
            $this->info("Would delete {$count} outbox events older than {$days} days.");
            return self::SUCCESS;
        }

        $deleted = $query->delete();

        $this->info("Deleted {$deleted} outbox events older than {$days} days.");

        return self::SUCCESS;
    }
}
