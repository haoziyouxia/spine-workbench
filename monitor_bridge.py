import time
import os
import winsound

BRIDGE_FILE = r'c:\haozi\work\openclaw\projects\spine-workbench\notes\nono-trae-bridge.md'
LAST_TASK_ID = None
LAST_STATUS = None

def parse_task(content):
    """解析当前任务信息"""
    if not content or '## Current Task' not in content:
        return None

    start = content.index('## Current Task')
    next_section = content.find('\n## ', start + 15)
    if next_section == -1:
        next_section = len(content)

    task_section = content[start:next_section]
    task_info = {}

    for line in task_section.split('\n'):
        if '- task_id:' in line:
            task_info['id'] = line.split(':', 1)[1].strip()
        elif '- title:' in line:
            task_info['title'] = line.split(':', 1)[1].strip()
        elif '- status:' in line:
            task_info['status'] = line.split(':', 1)[1].strip()

    return task_info

def check_for_new_task():
    """检查是否有新任务或状态变化"""
    global LAST_TASK_ID, LAST_STATUS

    try:
        with open(BRIDGE_FILE, 'r', encoding='utf-8') as f:
            content = f.read()

        task = parse_task(content)
        if not task:
            return None

        # 检测新任务或状态变化
        if task.get('id') != LAST_TASK_ID or task.get('status') != LAST_STATUS:
            LAST_TASK_ID = task.get('id')
            LAST_STATUS = task.get('status')
            return task

        return None

    except Exception as e:
        print(f"读取错误: {e}")
        return None

def play_notification():
    """播放提示音"""
    for _ in range(2):
        winsound.Beep(1000, 300)
        time.sleep(0.2)

def main():
    """监控新任务"""
    print("="*60)
    print("         Trae Bridge 任务监控服务")
    print("="*60)
    print(f"监控文件: {BRIDGE_FILE}")
    print("检测到新任务时会发出提示音")
    print("按 Ctrl+C 停止监控")
    print("="*60 + "\n")

    try:
        while True:
            task = check_for_new_task()
            if task:
                print(f"\n" + "="*60)
                print(f"时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"任务ID: {task.get('id')}")
                print(f"任务标题: {task.get('title')}")
                print(f"任务状态: {task.get('status')}")
                print("-"*60)
                print("请告诉 Trae: 去读 notes/nono-trae-bridge.md")
                print("="*60 + "\n")

                # 发出提示音
                play_notification()

            # 每10分钟检查一次
            time.sleep(600)

    except KeyboardInterrupt:
        print("\n监控服务已停止")
        print("下次使用请运行: python monitor_bridge.py")

if __name__ == '__main__':
    main()