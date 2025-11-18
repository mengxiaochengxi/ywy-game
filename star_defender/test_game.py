#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
游戏功能测试脚本
"""

import pygame
import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_pygame_init():
    """测试Pygame初始化"""
    try:
        pygame.init()
        print("✓ Pygame初始化成功")
        
        # 测试字体
        font = pygame.font.Font(None, 36)
        text = font.render("测试文字", True, (255, 255, 255))
        print("✓ Pygame字体功能正常")
        
        # 测试窗口创建
        screen = pygame.display.set_mode((480, 800))
        pygame.display.set_caption("测试窗口")
        print("✓ Pygame窗口创建成功")
        
        pygame.quit()
        return True
    except Exception as e:
        print(f"✗ Pygame初始化失败: {e}")
        return False

def test_game_import():
    """测试游戏模块导入"""
    try:
        import main
        print("✓ 游戏模块导入成功")
        return True
    except Exception as e:
        print(f"✗ 游戏模块导入失败: {e}")
        return False

def test_game_class():
    """测试游戏主类"""
    try:
        from main import StarDefender
        print("✓ 游戏主类导入成功")
        return True
    except Exception as e:
        print(f"✗ 游戏主类导入失败: {e}")
        return False

if __name__ == "__main__":
    print("=== 星际捍卫者于闻言游戏测试 ===")
    
    # 运行所有测试
    tests = [
        test_pygame_init,
        test_game_import,
        test_game_class
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"=== 测试结果: {passed}/{total} 测试通过 ===")
    
    if passed == total:
        print("🎉 所有测试通过！游戏应该可以正常运行。")
        print("\n启动游戏命令:")
        print("python main.py")
        print("\n操作说明:")
        print("- 鼠标拖动: 移动战机")
        print("- 松开鼠标: 停止射击")
        print("- B键或点击炸弹图标: 使用全屏轰炸")
        print("- P键或ESC键: 暂停游戏")
        print("- 空格键: 开始游戏")
    else:
        print("❌ 部分测试失败，请检查错误信息。")