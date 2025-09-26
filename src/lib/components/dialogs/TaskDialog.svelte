<script lang="ts">
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
    import { TimePicker } from "$lib/components/ui/time-picker";
    import { format, addDays } from 'date-fns';
    import { v4 as uuidv4 } from "uuid";
    import { tasksStore, type Task } from "$lib/stores/tasks";
    import { getTimeSlot } from "$lib/utils";

    export let open: boolean = false;

    let title = "";
    let description = "";
    let scheduledTime = "";
    let selectedDate = "today";

    $: if (open && !scheduledTime) scheduledTime = 'now';

    $: today = format(new Date(), 'yyyy-MM-dd');
    $: tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    $: taskDate = selectedDate === 'today' ? today : tomorrow;

    $: if (open && !scheduledTime) scheduledTime = 'now';

    function addTask() {
        if (title.trim()) {
            const newTask: Task = {
                id: uuidv4(),
                type: "task",
                title: title.trim(),
                description: description.trim() || undefined,
                date: taskDate,
                timeSlot: getTimeSlot(scheduledTime),
                scheduledTime: scheduledTime || undefined,
                completed: false,
                synced: false,
            };
            tasksStore.update((list) => [...list, newTask]);
            title = "";
            description = "";
            scheduledTime = "";
            selectedDate = "today";
            open = false;
        }
    }

    $: isValid = title.trim().length > 0;
    $: currentTime = new Date().toTimeString().slice(0, 5);
    $: isValidTime = !scheduledTime || scheduledTime >= currentTime;
</script>

<Dialog bind:open>
    <DialogTrigger>
        <slot />
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
            <div>
                <Label for="title">Title *</Label>
                <Input
                    id="title"
                    bind:value={title}
                    placeholder="Enter task title"
                    class="mt-2"
                    required
                />
            </div>
            <div>
                <Label for="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    bind:value={description}
                    placeholder="Add more details about the task"
                    class="mt-2"
                    rows={3}
                />
            </div>
            <div>
                <Label for="scheduledTime">Scheduled Time</Label>
                <div class="mt-2">
                    <TimePicker id="scheduledTime" bind:initialValue={scheduledTime} on:change={(e) => scheduledTime = e.detail} />
                </div>
                {#if scheduledTime && !isValidTime}
                    <p class="text-sm text-destructive mt-1">Scheduled time cannot be in the past</p>
                {/if}
            </div>
            <div>
                <Label for="date">Date</Label>
                <div class="mt-2">
                    <SelectRoot bind:value={selectedDate} type="single">
                        <SelectTrigger>
                            {selectedDate === 'today' ? 'Today' : 'Tomorrow'}
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        </SelectContent>
                    </SelectRoot>
                </div>
            </div>
        </div>
        <DialogFooter>
            <DialogClose>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onclick={addTask} disabled={!isValid || !isValidTime}>Add Task</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
