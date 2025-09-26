<script lang="ts">
    // ReminderDialog.svelte - UX Improvements (2025-09-25)
    // - Vertical layout to match app's dialog patterns.
    // - Character counters below inputs for consistency.
    // - Required fields marked with *.
    // - Improved spacing and typography.
    // - Accessible attributes maintained.
    import { Button } from "$lib/components/ui/button";
    import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
        DialogTrigger,
        DialogClose,
        DialogFooter,
    } from "$lib/components/ui/dialog";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Root as SelectRoot,
        Trigger as SelectTrigger,
        Content as SelectContent,
        Item as SelectItem,
    } from "$lib/components/ui/select";
    import { Calendar } from "$lib/components/ui/calendar";
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from "$lib/components/ui/popover";
    import { TimePicker } from "$lib/components/ui/time-picker";
    import { v4 as uuidv4 } from "uuid";
    import { remindersStore, type Reminder } from "$lib/stores/reminders";
    import { CalendarIcon } from "@lucide/svelte";
    import { format } from "date-fns";
    import { getLocalTimeZone, type DateValue } from "@internationalized/date";

    export let open: boolean = false;

    let title = "";
    let description = "";
    let scheduledDate: DateValue | undefined = undefined;
    let scheduledTime = new Date().toTimeString().slice(0, 5);
    let reminderType: "one-time" | "recurring" = "one-time";
    let recurring: "daily" | "weekly" | "monthly" = "daily";

    // UX / validation state
    const TITLE_MAX = 80;
    const DESCRIPTION_MAX = 200;
    let attemptedSubmit = false;

    $: scheduledFor = scheduledDate && scheduledTime ? (() => {
        const date = scheduledDate.toDate(getLocalTimeZone());
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
    })() : "";

    $: isValid = title.trim().length > 0 && !!scheduledFor;

    $: if (open) scheduledTime = new Date().toTimeString().slice(0, 5);

    function addReminder() {
        attemptedSubmit = true;
        if (!isValid) return;

        const now = new Date().toISOString();
        const newReminder: Reminder = {
            id: uuidv4(),
            type: "reminder",
            title: title.trim(),
            description: description.trim() || undefined,
            scheduledFor,
            reminderType,
            recurring: reminderType === "recurring" ? recurring : undefined,
            completed: false,
            notified: false,
            timestamp: now,
            synced: false,
            createdAt: now,
            updatedAt: now,
        };
        remindersStore.update((list) => [...list, newReminder]);

        // reset with small delay to allow UI to show confirmation if needed
        title = "";
        description = "";
        scheduledDate = undefined;
        scheduledTime = "";
        reminderType = "one-time";
        recurring = "daily";
        attemptedSubmit = false;
        open = false;
    }
</script>

<Dialog bind:open>
    <DialogTrigger>
        <slot />
    </DialogTrigger>
    <DialogContent aria-labelledby="reminder-title" aria-describedby="reminder-desc">
        <DialogHeader>
            <DialogTitle id="reminder-title">Add New Reminder</DialogTitle>
        </DialogHeader>
        <div class="space-y-6">
            <div>
                <Label for="title" class="text-sm font-medium">Title *</Label>
                <Input
                    id="title"
                    bind:value={title}
                    placeholder="e.g. Call the vet"
                    class="mt-2"
                    maxlength={TITLE_MAX}
                    aria-describedby="title-error"
                />
                <div class="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{title.length} / {TITLE_MAX} characters</span>
                </div>
                {#if attemptedSubmit && !title.trim()}
                    <p id="title-error" class="text-sm text-red-600 mt-1">Please enter a title for the reminder.</p>
                {/if}
            </div>
            <div>
                <Label for="description" class="text-sm font-medium">Description <span class="text-xs text-slate-400">(optional)</span></Label>
                <Textarea
                    id="description"
                    bind:value={description}
                    placeholder="Add a sentence or two to provide context (optional)"
                    class="mt-2 min-h-[100px] resize-none"
                    maxlength={DESCRIPTION_MAX}
                />
                <div class="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{description.length} / {DESCRIPTION_MAX} characters</span>
                </div>
            </div>
                        <div>
                <Label for="scheduledDate" class="text-sm font-medium">Scheduled Date *</Label>
                <div class="mt-2">
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                variant="outline"
                                class="w-full justify-start text-left font-normal"
                                id="scheduledDate"
                                aria-label={scheduledDate ? `Selected date ${format(scheduledDate.toDate(getLocalTimeZone()), 'PPP')}` : 'Pick a date'}
                            >
                                <CalendarIcon class="mr-2 h-4 w-4" />
                                {scheduledDate
                                    ? format(
                                          scheduledDate.toDate(
                                              getLocalTimeZone(),
                                          ),
                                          "PPP",
                                      )
                                    : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent class="w-auto p-0">
                            <Calendar
                                bind:value={scheduledDate}
                                type="single"
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                {#if attemptedSubmit && !scheduledDate}
                    <p class="text-sm text-red-600 mt-1">Please pick a date for the reminder.</p>
                {/if}
            </div>
            <div>
                <Label for="scheduledTime" class="text-sm font-medium">Scheduled Time</Label>
                <div class="mt-2">
                    <TimePicker id="scheduledTime" initialValue={scheduledTime} on:change={(e) => scheduledTime = e.detail} />
                </div>
            </div>
            <div>
                <Label for="reminderType" class="text-sm font-medium">Reminder Type</Label>
                <div class="mt-2">
                    <SelectRoot bind:value={reminderType} type="single">
                        <SelectTrigger>
                            {reminderType}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="one-time"
                                >One-time</SelectItem
                            >
                            <SelectItem value="recurring"
                                >Recurring</SelectItem
                            >
                        </SelectContent>
                    </SelectRoot>
                </div>
            </div>
            {#if reminderType === "recurring"}
                <div>
                    <Label for="recurring" class="text-sm font-medium">Frequency</Label>
                    <div class="mt-2">
                        <SelectRoot bind:value={recurring} type="single">
                            <SelectTrigger>
                                {recurring}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly"
                                    >Weekly</SelectItem
                                >
                                <SelectItem value="monthly"
                                    >Monthly</SelectItem
                                >
                            </SelectContent>
                        </SelectRoot>
                    </div>
                </div>
            {/if}


        </div>
        <DialogFooter class="gap-3">
            <DialogClose>
                <Button variant="outline" class="px-6">Cancel</Button>
            </DialogClose>
            <Button type="button" onclick={addReminder} disabled={!isValid} class="px-6">Add Reminder</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
