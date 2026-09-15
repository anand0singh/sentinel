// +build ignore
#include <uapi/linux/ptrace.h>
#include <linux/sched.h>
#include <linux/fs.h>
#include <linux/socket.h>
#include <linux/in.h>

#define ARGSIZE 128
#define TASK_COMM_LEN 16

// Event structure pushed to user space via BPF_PERF_OUTPUT
struct event_t {
    u32 pid;
    u32 ppid;
    u32 uid;
    u32 type; // 1 = EXEC, 2 = CONNECT
    char comm[TASK_COMM_LEN];
    char filename[ARGSIZE];
    u32 saddr;
    u32 daddr;
    u16 dport;
};

BPF_PERF_OUTPUT(events);

// Hook binary execution
TRACEPOINT_PROBE(syscalls, sys_enter_execve) {
    struct event_t event = {};
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();

    event.pid = bpf_get_current_pid_tgid() >> 32;
    event.ppid = task->real_parent->tgid;
    event.uid = bpf_get_current_uid_gid() & 0xFFFFFFFF;
    event.type = 1;

    bpf_get_current_comm(&event.comm, sizeof(event.comm));
    bpf_probe_read_user_str(&event.filename, sizeof(event.filename), args->filename);

    events.perf_submit(args, &event, sizeof(event));
    return 0;
}

// Hook network socket connections
TRACEPOINT_PROBE(syscalls, sys_enter_connect) {
    struct sockaddr_in uservaddr;
    struct event_t event = {};
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();

    // Read sockaddr struct pointer from args->uservaddr
    if (bpf_probe_read_user(&uservaddr, sizeof(uservaddr), args->uservaddr) < 0) {
        return 0;
    }

    // Only process AF_INET (IPv4)
    if (uservaddr.sin_family != AF_INET) {
        return 0;
    }

    event.pid = bpf_get_current_pid_tgid() >> 32;
    event.ppid = task->real_parent->tgid;
    event.uid = bpf_get_current_uid_gid() & 0xFFFFFFFF;
    event.type = 2;
    event.daddr = uservaddr.sin_addr.s_addr;
    event.dport = uservaddr.sin_port; // Network byte order

    bpf_get_current_comm(&event.comm, sizeof(event.comm));

    events.perf_submit(args, &event, sizeof(event));
    return 0;
}
