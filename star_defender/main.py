#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
星际捍卫者 (Star Defender)
竖屏飞行射击游戏
开发：于闻言
"""

import pygame
import sys
import random
import math

# 初始化Pygame
pygame.init()

# 游戏常量
SCREEN_WIDTH = 480
SCREEN_HEIGHT = 800
FPS = 60

# 颜色定义
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
CYAN = (0, 255, 255)

# 游戏状态
START_MENU = 0
GAME_PLAYING = 1
GAME_PAUSED = 2
GAME_OVER = 3
GAME_WON = 4

class StarDefender:
    """游戏主类"""
    
    def __init__(self):
        # 设置屏幕
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("星际捍卫者于闻言")
        self.clock = pygame.time.Clock()
        
        # 游戏状态
        self.game_state = START_MENU
        self.score = 0
        self.level = 1
        self.max_levels = 5
        
        # 玩家
        self.player = Player(self)
        
        # 游戏对象列表
        self.bullets = []
        self.enemies = []
        self.particles = []
        self.power_ups = []
        
        # 对象池
        self.bullet_pool = []
        self.enemy_pool = []
        
        # 道具系统
        self.bomb_count = 3
        self.last_bullet_power_up = 0
        self.last_bomb_power_up = 0
        self.bullet_power_up_active = False
        self.bullet_power_up_time = 0
        self.bullet_power_up_duration = 5000  # 5秒
        
        # Boss相关
        self.boss = None
        self.boss_spawned = False
        
        # 背景
        self.background = Background()
        
        # 字体 - 使用系统自带的中文字体
        try:
            # 尝试使用微软雅黑字体
            font_path = "C:/Windows/Fonts/msyh.ttc"
            self.font_small = pygame.font.Font(font_path, 24)
            self.font_medium = pygame.font.Font(font_path, 36)
            self.font_large = pygame.font.Font(font_path, 48)
        except Exception:
            try:
                # 尝试使用黑体字体
                font_path = "C:/Windows/Fonts/simhei.ttf"
                self.font_small = pygame.font.Font(font_path, 24)
                self.font_medium = pygame.font.Font(font_path, 36)
                self.font_large = pygame.font.Font(font_path, 48)
            except Exception:
                # 如果都失败，回退到默认字体
                self.font_small = pygame.font.Font(None, 24)
                self.font_medium = pygame.font.Font(None, 36)
                self.font_large = pygame.font.Font(None, 48)
        
        # 游戏计时器
        self.game_timer = pygame.time.get_ticks()
        self.enemy_spawn_timer = 0
        self.enemy_spawn_interval = 1000  # 初始1秒生成一个敌人
    
    def run(self):
        """游戏主循环"""
        while True:
            self.handle_events()
            
            if self.game_state == GAME_PLAYING:
                self.update()
            
            self.draw()
            self.clock.tick(FPS)
    
    def handle_events(self):
        """处理事件"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            
            if event.type == pygame.KEYDOWN:
                # 游戏菜单
                if self.game_state == START_MENU:
                    if event.key == pygame.K_SPACE:
                        self.start_game()
                
                # 游戏中
                elif self.game_state == GAME_PLAYING:
                    if event.key == pygame.K_p or event.key == pygame.K_ESCAPE:
                        self.pause_game()
                    elif event.key == pygame.K_b:
                        self.use_bomb()
                
                # 暂停菜单
                elif self.game_state == GAME_PAUSED:
                    if event.key == pygame.K_p or event.key == pygame.K_ESCAPE:
                        self.resume_game()
                    elif event.key == pygame.K_r:
                        self.restart_game()
                
                # 游戏结束或胜利
                elif self.game_state in [GAME_OVER, GAME_WON]:
                    if event.key == pygame.K_r:
                        self.restart_game()
                    elif event.key == pygame.K_q:
                        pygame.quit()
                        sys.exit()
            
            # 鼠标事件（用于触屏）
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if self.game_state == START_MENU:
                    self.start_game()
                elif self.game_state == GAME_PLAYING:
                    mouse_pos = pygame.mouse.get_pos()
                    # 检查是否点击了炸弹按钮
                    bomb_rect = pygame.Rect(SCREEN_WIDTH - 60, 10, 50, 50)
                    if bomb_rect.collidepoint(mouse_pos):
                        self.use_bomb()
    
    def start_game(self):
        """开始游戏"""
        self.game_state = GAME_PLAYING
        self.reset_game()
    
    def pause_game(self):
        """暂停游戏"""
        self.game_state = GAME_PAUSED
    
    def resume_game(self):
        """恢复游戏"""
        self.game_state = GAME_PLAYING
    
    def restart_game(self):
        """重新开始游戏"""
        self.reset_game()
        self.game_state = GAME_PLAYING
    
    def reset_game(self):
        """重置游戏状态"""
        self.score = 0
        self.level = 1
        self.player.reset()
        
        # 清空对象
        self.bullets.clear()
        self.enemies.clear()
        self.particles.clear()
        self.power_ups.clear()
        
        # 重置道具
        self.bomb_count = 3
        self.bullet_power_up_active = False
        self.bullet_power_up_time = 0
        self.last_bullet_power_up = 0
        self.last_bomb_power_up = 0
        
        # 重置Boss
        self.boss = None
        self.boss_spawned = False
        
        # 重置计时器
        self.game_timer = pygame.time.get_ticks()
        self.enemy_spawn_timer = 0
        self.enemy_spawn_interval = 1000
    
    def update(self):
        """更新游戏状态"""
        current_time = pygame.time.get_ticks()
        
        # 更新背景
        self.background.update()
        
        # 更新玩家
        self.player.update()
        
        # 检查玩家是否死亡
        if self.player.lives <= 0:
            self.game_over()
        
        # 更新子弹
        for bullet in self.bullets[:]:
            bullet.update()
            if bullet.y < 0:
                self.bullets.remove(bullet)
        
        # 更新敌人
        for enemy in self.enemies[:]:
            enemy.update()
            if enemy.y > SCREEN_HEIGHT:
                self.enemies.remove(enemy)
        
        # 更新粒子效果
        for particle in self.particles[:]:
            particle.update()
            if particle.life <= 0:
                self.particles.remove(particle)
        
        # 更新道具
        for power_up in self.power_ups[:]:
            power_up.update()
            if power_up.y > SCREEN_HEIGHT:
                self.power_ups.remove(power_up)
        
        # 生成敌人
        self.spawn_enemies()
        
        # 生成道具
        self.spawn_power_ups()
        
        # 检查碰撞
        self.check_collisions()
        
        # 检查Boss生成条件
        if not self.boss_spawned and self.enemy_spawn_timer > 30000:  # 30秒后生成Boss
            self.spawn_boss()
        
        # 更新Boss
        if self.boss and self.boss_spawned:
            self.boss.update()
            if self.boss.health <= 0:
                self.boss_defeated()
        
        # 更新子弹增强效果
        if self.bullet_power_up_active:
            if current_time - self.bullet_power_up_time > self.bullet_power_up_duration:
                self.bullet_power_up_active = False
    
    def draw(self):
        """绘制游戏画面"""
        self.background.draw(self.screen)
        
        # 绘制游戏元素
        if self.game_state in [GAME_PLAYING, GAME_PAUSED]:
            # 绘制玩家
            self.player.draw(self.screen)
            
            # 绘制子弹
            for bullet in self.bullets:
                bullet.draw(self.screen)
            
            # 绘制敌人
            for enemy in self.enemies:
                enemy.draw(self.screen)
            
            # 绘制粒子效果
            for particle in self.particles:
                particle.draw(self.screen)
            
            # 绘制道具
            for power_up in self.power_ups:
                power_up.draw(self.screen)
            
            # 绘制Boss
            if self.boss and self.boss_spawned:
                self.boss.draw(self.screen)
                self.draw_boss_health_bar()
            
            # 绘制UI
            self.draw_ui()
        
        # 绘制菜单
        if self.game_state == START_MENU:
            self.draw_start_menu()
        elif self.game_state == GAME_PAUSED:
            self.draw_pause_menu()
        elif self.game_state == GAME_OVER:
            self.draw_game_over()
        elif self.game_state == GAME_WON:
            self.draw_game_won()
        
        pygame.display.flip()
    
    def start_game(self):
        """开始游戏"""
        self.game_state = GAME_PLAYING
        self.reset_game()
    
    def game_over(self):
        """游戏结束"""
        self.game_state = GAME_OVER
    
    def game_won(self):
        """游戏胜利"""
        self.game_state = GAME_WON
    
    def pause_game(self):
        """暂停游戏"""
        self.game_state = GAME_PAUSED
    
    def resume_game(self):
        """恢复游戏"""
        self.game_state = GAME_PLAYING
    
    def restart_game(self):
        """重新开始游戏"""
        self.reset_game()
        self.game_state = GAME_PLAYING
    
    def spawn_enemies(self):
        """生成敌人"""
        current_time = pygame.time.get_ticks()
        
        if self.boss_spawned:
            return  # Boss出现后不再生成普通敌人
        
        if current_time - self.enemy_spawn_timer > self.enemy_spawn_interval:
            enemy_type = random.choice(["small", "medium", "meteor"])
            
            if enemy_type == "small":
                enemy = SmallScout(random.randint(50, SCREEN_WIDTH - 50), -50)
            elif enemy_type == "medium":
                enemy = MediumFrigate(random.randint(60, SCREEN_WIDTH - 60), -60)
            elif enemy_type == "meteor":
                enemy = Meteor(random.randint(50, SCREEN_WIDTH - 50), -50)
            
            self.enemies.append(enemy)
            self.enemy_spawn_timer = current_time
            
            # 随着关卡提升，减少生成间隔（最低300毫秒）
            self.enemy_spawn_interval = max(300, 1000 - (self.level - 1) * 100)
    
    def spawn_power_ups(self):
        """生成道具"""
        current_time = pygame.time.get_ticks()
        
        # 子弹增强道具（最小间隔5秒）
        if current_time - self.last_bullet_power_up > 5000:
            if random.random() < 0.02:  # 2%概率生成
                power_up = PowerUp(random.randint(50, SCREEN_WIDTH - 50), -50, "bullet")
                self.power_ups.append(power_up)
                self.last_bullet_power_up = current_time
        
        # 全屏轰炸道具（最小间隔7秒）
        if current_time - self.last_bomb_power_up > 7000:
            if random.random() < 0.01:  # 1%概率生成
                power_up = PowerUp(random.randint(50, SCREEN_WIDTH - 50), -50, "bomb")
                self.power_ups.append(power_up)
                self.last_bomb_power_up = current_time
    
    def spawn_boss(self):
        """生成Boss"""
        self.boss = Boss(SCREEN_WIDTH // 2 - 100, -200, self.level)
        self.boss_spawned = True
    
    def use_bomb(self):
        """使用全屏轰炸"""
        if self.bomb_count > 0:
            self.bomb_count -= 1
            
            # 清除所有普通敌机和子弹
            for enemy in self.enemies[:]:
                if not isinstance(enemy, Boss):
                    self.create_explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                    self.score += enemy.points
                    self.enemies.remove(enemy)
            
            for bullet in self.bullets[:]:
                self.bullets.remove(bullet)
            
            # 对Boss造成固定伤害
            if self.boss and self.boss_spawned:
                self.boss.take_damage(13)  # 相当于13发普通子弹的伤害
                self.create_explosion(self.boss.x + self.boss.width // 2, self.boss.y + self.boss.height // 2)
            
            # 创建爆炸效果
            self.create_bomb_explosion()
    
    def create_explosion(self, x, y):
        """创建爆炸效果"""
        for _ in range(8):
            particle = Particle(x, y, random.randint(1, 5), 
                               (random.randint(200, 255), random.randint(50, 150), 0), 
                               random.randint(-5, 5), random.randint(-5, 5), 60)
            self.particles.append(particle)
    
    def create_bomb_explosion(self):
        """创建轰炸爆炸效果"""
        for _ in range(20):
            x = random.randint(0, SCREEN_WIDTH)
            y = random.randint(0, SCREEN_HEIGHT)
            particle = Particle(x, y, random.randint(3, 8), 
                               (random.randint(150, 255), random.randint(50, 200), random.randint(50, 255)), 
                               random.randint(-3, 3), random.randint(-3, 3), 120)
            self.particles.append(particle)
    
    def check_collisions(self):
        """检查碰撞"""
        # 玩家子弹与敌人
        for bullet in self.bullets[:]:
            for enemy in self.enemies[:]:
                if bullet.rect.colliderect(enemy.rect):
                    enemy.take_damage(bullet.damage)
                    self.bullets.remove(bullet)
                    
                    if enemy.health <= 0:
                        self.create_explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                        self.score += enemy.points
                        self.enemies.remove(enemy)
                    break
        
        # 玩家与敌人
        for enemy in self.enemies[:]:
            if self.player.rect.colliderect(enemy.rect):
                self.player.take_damage()
                self.create_explosion(enemy.x + enemy.width // 2, enemy.y + enemy.height // 2)
                
                if not isinstance(enemy, Meteor):
                    self.score += enemy.points
                
                self.enemies.remove(enemy)
        
        # 玩家与道具
        for power_up in self.power_ups[:]:
            if self.player.rect.colliderect(power_up.rect):
                if power_up.type == "bullet":
                    self.activate_bullet_power_up()
                elif power_up.type == "bomb":
                    self.bomb_count = min(9, self.bomb_count + 1)  # 最多9个
                
                self.power_ups.remove(power_up)
        
        # 敌人子弹与玩家
        for enemy in self.enemies:
            for bullet in enemy.bullets[:]:
                if self.player.rect.colliderect(bullet.rect):
                    self.player.take_damage()
                    self.create_explosion(bullet.x, bullet.y)
                    enemy.bullets.remove(bullet)
                    break
    
    def activate_bullet_power_up(self):
        """激活子弹增强"""
        self.bullet_power_up_active = True
        self.bullet_power_up_time = pygame.time.get_ticks()
    
    def boss_defeated(self):
        """Boss被击败"""
        self.create_explosion(self.boss.x + self.boss.width // 2, self.boss.y + self.boss.height // 2)
        self.score += 1000  # Boss奖励分数
        self.boss_spawned = False
        
        if self.level < self.max_levels:
            # 进入下一关
            self.level += 1
            self.boss_spawned = False
            self.enemy_spawn_timer = 0
            # 增加敌人生成速度
            self.enemy_spawn_interval = max(300, 1000 - (self.level - 1) * 100)
        else:
            # 游戏胜利
            self.game_won()
    
    def draw_ui(self):
        """绘制UI"""
        # 分数
        score_text = self.font_medium.render(f"分数: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        # 生命值
        lives_text = self.font_medium.render(f"生命: {'❤️' * self.player.lives}", True, WHITE)
        self.screen.blit(lives_text, (10, 40))
        
        # 关卡
        level_text = self.font_medium.render(f"关卡: {self.level}", True, WHITE)
        self.screen.blit(level_text, (10, 70))
        
        # 炸弹数量
        bomb_text = self.font_medium.render(f"BOMB: {self.bomb_count}", True, WHITE)
        self.screen.blit(bomb_text, (SCREEN_WIDTH - 120, 10))
        
        # 炸弹按钮
        bomb_rect = pygame.Rect(SCREEN_WIDTH - 60, 10, 50, 50)
        pygame.draw.rect(self.screen, (100, 100, 100), bomb_rect)
        pygame.draw.rect(self.screen, WHITE, bomb_rect, 2)
        bomb_icon = self.font_medium.render("B", True, WHITE)
        self.screen.blit(bomb_icon, (SCREEN_WIDTH - 40, 20))
        
        # 子弹增强状态
        if self.bullet_power_up_active:
            power_up_time = (self.bullet_power_up_duration - 
                           (pygame.time.get_ticks() - self.bullet_power_up_time)) // 1000
            power_up_text = self.font_small.render(f"子弹增强: {power_up_time}s", True, YELLOW)
            self.screen.blit(power_up_text, (10, SCREEN_HEIGHT - 30))
    
    def draw_boss_health_bar(self):
        """绘制Boss血条"""
        if not self.boss or not self.boss_spawned:
            return
        
        bar_width = SCREEN_WIDTH - 40
        bar_height = 20
        x = 20
        y = 20
        
        # 背景
        pygame.draw.rect(self.screen, BLACK, (x - 2, y - 2, bar_width + 4, bar_height + 4))
        
        # 血条
        health_percentage = self.boss.health / self.boss.max_health
        health_width = int(bar_width * health_percentage)
        
        # 根据血量显示不同颜色
        if health_percentage > 0.5:
            color = GREEN
        elif health_percentage > 0.2:
            color = YELLOW
        else:
            color = RED
        
        pygame.draw.rect(self.screen, color, (x, y, health_width, bar_height))
        
        # 边框
        pygame.draw.rect(self.screen, WHITE, (x, y, bar_width, bar_height), 2)
        
        # 文字
        boss_text = self.font_medium.render(f"BOSS LEVEL {self.level}", True, WHITE)
        text_rect = boss_text.get_rect(center=(SCREEN_WIDTH // 2, y + bar_height // 2))
        self.screen.blit(boss_text, text_rect)
    
    def draw_start_menu(self):
        """绘制开始菜单"""
        # 半透明背景
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(180)
        self.screen.blit(overlay, (0, 0))
        
        # 标题
        title = self.font_large.render("星际捍卫者于闻言", True, WHITE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(title, title_rect)
        
        # 副标题
        subtitle = self.font_medium.render("Star Defender", True, CYAN)
        subtitle_rect = subtitle.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        self.screen.blit(subtitle, subtitle_rect)
        
        # 提示
        hint = self.font_small.render("按空格键开始游戏", True, WHITE)
        hint_rect = hint.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))
        self.screen.blit(hint, hint_rect)
        
        # 操作说明
        controls = [
            "操作说明:",
            "- 鼠标拖动: 移动战机",
            "- 松开鼠标: 自动射击",
            "- B键或点击炸弹图标: 使用全屏轰炸",
            "- P键: 暂停游戏"
        ]
        
        for i, line in enumerate(controls):
            text = self.font_small.render(line, True, WHITE)
            text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 100 + i * 25))
            self.screen.blit(text, text_rect)
    
    def draw_pause_menu(self):
        """绘制暂停菜单"""
        # 半透明背景
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(200)
        self.screen.blit(overlay, (0, 0))
        
        # 标题
        title = self.font_large.render("游戏暂停", True, WHITE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        self.screen.blit(title, title_rect)
        
        # 提示
        hint1 = self.font_medium.render("按P键或ESC键继续", True, WHITE)
        hint1_rect = hint1.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 20))
        self.screen.blit(hint1, hint1_rect)
        
        hint2 = self.font_medium.render("按R键重新开始", True, WHITE)
        hint2_rect = hint2.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 60))
        self.screen.blit(hint2, hint2_rect)
    
    def draw_game_over(self):
        """绘制游戏结束界面"""
        # 半透明背景
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(200)
        self.screen.blit(overlay, (0, 0))
        
        # 标题
        title = self.font_large.render("游戏结束", True, RED)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(title, title_rect)
        
        # 分数
        score_text = self.font_medium.render(f"最终分数: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 30))
        self.screen.blit(score_text, score_rect)
        
        # 关卡
        level_text = self.font_medium.render(f"到达关卡: {self.level}", True, WHITE)
        level_rect = level_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 10))
        self.screen.blit(level_text, level_rect)
        
        # 提示
        hint1 = self.font_medium.render("按R键重新开始", True, WHITE)
        hint1_rect = hint1.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 70))
        self.screen.blit(hint1, hint1_rect)
        
        hint2 = self.font_medium.render("按ESC键退出", True, WHITE)
        hint2_rect = hint2.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 110))
        self.screen.blit(hint2, hint2_rect)
    
    def draw_game_won(self):
        """绘制游戏胜利界面"""
        # 半透明背景
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.fill(BLACK)
        overlay.set_alpha(200)
        self.screen.blit(overlay, (0, 0))
        
        # 标题
        title = self.font_large.render("游戏胜利!", True, GREEN)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 100))
        self.screen.blit(title, title_rect)
        
        # 恭喜
        congrats = self.font_medium.render("恭喜你击败了所有Boss!", True, YELLOW)
        congrats_rect = congrats.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 50))
        self.screen.blit(congrats, congrats_rect)
        
        # 分数
        score_text = self.font_medium.render(f"最终分数: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 10))
        self.screen.blit(score_text, score_rect)
        
        # 提示
        hint = self.font_medium.render("按R键重新开始", True, WHITE)
        hint_rect = hint.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 70))
        self.screen.blit(hint, hint_rect)


class Player:
    """玩家战机类"""
    
    def __init__(self, game):
        self.game = game  # 引用游戏实例
        self.width = 40
        self.height = 60
        self.x = SCREEN_WIDTH // 2 - self.width // 2
        self.y = SCREEN_HEIGHT - 100
        self.speed = 8
        self.lives = 3
        self.invulnerable = False
        self.invulnerable_time = 0
        self.invulnerable_duration = 1000  # 1秒无敌时间
        
        # 子弹相关
        self.shoot_timer = 0
        self.shoot_interval = 200  # 200毫秒发射一次
        
        # 碰撞矩形
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
        # 鼠标控制
        self.mouse_down = False
        self.target_x = self.x
        
        # 自动射击相关
        self.game_start_time = 0
        self.auto_shoot_enabled = False
    
    def reset(self):
        """重置玩家状态"""
        self.x = SCREEN_WIDTH // 2 - self.width // 2
        self.y = SCREEN_HEIGHT - 100
        self.lives = 3
        self.invulnerable = False
        self.invulnerable_time = 0
        self.shoot_timer = 0
        self.target_x = self.x
        self.rect.topleft = (self.x, self.y)
        self.game_start_time = pygame.time.get_ticks()
        self.auto_shoot_enabled = False
    
    def update(self):
        """更新玩家状态"""
        current_time = pygame.time.get_ticks()
        
        # 鼠标控制
        self.handle_mouse_control()
        
        # 移动
        if abs(self.target_x - self.x) > 5:
            if self.target_x > self.x:
                self.x += self.speed
            else:
                self.x -= self.speed
        
        # 边界检查
        self.x = max(0, min(SCREEN_WIDTH - self.width, self.x))
        
        # 更新碰撞矩形
        self.rect.topleft = (self.x, self.y)
        
        # 自动射击控制
        current_time = pygame.time.get_ticks()
        if not self.auto_shoot_enabled:
            if current_time - self.game_start_time > 1000:  # 1秒后启用自动射击
                self.auto_shoot_enabled = True
        
        # 自动射击
        if self.mouse_down or self.auto_shoot_enabled:
            self.shoot()
        
        # 更新无敌状态
        if self.invulnerable:
            if current_time - self.invulnerable_time > self.invulnerable_duration:
                self.invulnerable = False
    
    def handle_mouse_control(self):
        """处理鼠标控制"""
        mouse_buttons = pygame.mouse.get_pressed()
        mouse_x, mouse_y = pygame.mouse.get_pos()
        
        # 鼠标按下
        if mouse_buttons[0]:
            self.mouse_down = True
            self.target_x = mouse_x - self.width // 2
        else:
            self.mouse_down = False
    
    def shoot(self):
        """射击"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > self.shoot_interval:
            # 创建子弹
            self.game.bullets.append(Bullet(self.x + self.width // 2 - 2, self.y, -10, 4, 8, WHITE, 1))
            
            # 增强子弹模式
            if self.game.bullet_power_up_active:
                # 散射子弹
                self.game.bullets.append(Bullet(self.x + self.width // 2 - 15, self.y, -10, 4, 8, YELLOW, 1))
                self.game.bullets.append(Bullet(self.x + self.width // 2 + 11, self.y, -10, 4, 8, YELLOW, 1))
            
            self.shoot_timer = current_time
    
    def take_damage(self):
        """受到伤害"""
        if not self.invulnerable:
            self.lives -= 1
            self.invulnerable = True
            self.invulnerable_time = pygame.time.get_ticks()
    
    def draw(self, screen):
        """绘制玩家战机"""
        # 闪烁效果（无敌时）
        if not self.invulnerable or pygame.time.get_ticks() % 200 < 100:
            # 绘制战机（手绘画风）
            # 主体
            pygame.draw.polygon(screen, (0, 150, 255), [
                (self.x + self.width // 2, self.y),
                (self.x, self.y + self.height),
                (self.x + self.width, self.y + self.height)
            ])
            
            # 驾驶舱
            pygame.draw.circle(screen, (255, 255, 200), 
                              (self.x + self.width // 2, self.y + 20), 8)
            
            # 引擎
            pygame.draw.rect(screen, (200, 100, 0), 
                           (self.x + 10, self.y + self.height - 10, 8, 15))
            pygame.draw.rect(screen, (200, 100, 0), 
                           (self.x + self.width - 18, self.y + self.height - 10, 8, 15))
            
            # 引擎火焰
            pygame.draw.polygon(screen, (255, 150, 0), [
                (self.x + 14, self.y + self.height),
                (self.x + 10, self.y + self.height + 20),
                (self.x + 18, self.y + self.height + 20)
            ])
            pygame.draw.polygon(screen, (255, 150, 0), [
                (self.x + self.width - 14, self.y + self.height),
                (self.x + self.width - 22, self.y + self.height + 20),
                (self.x + self.width - 14, self.y + self.height + 20)
            ])
            
            # 武器
            pygame.draw.rect(screen, (100, 100, 100), 
                           (self.x + self.width // 2 - 2, self.y - 10, 4, 15))


class Bullet:
    """子弹类"""
    
    def __init__(self, x, y, speed, width, height, color, damage):
        self.x = x
        self.y = y
        self.speed = speed
        self.width = width
        self.height = height
        self.color = color
        self.damage = damage
        
        # 碰撞矩形
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
    
    def update(self):
        """更新子弹位置"""
        self.y += self.speed
        self.rect.topleft = (self.x, self.y)
    
    def draw(self, screen):
        """绘制子弹"""
        pygame.draw.rect(screen, self.color, self.rect)
        
        # 子弹发光效果
        if self.color == YELLOW:
            glow_surface = pygame.Surface((self.width + 6, self.height + 6), pygame.SRCALPHA)
            pygame.draw.rect(glow_surface, (255, 255, 0, 50), (3, 3, self.width, self.height))
            screen.blit(glow_surface, (self.x - 3, self.y - 3))


class Enemy:
    """敌机基类"""
    
    def __init__(self, x, y, width, height, speed, health, points):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.speed = speed
        self.health = health
        self.max_health = health
        self.points = points
        self.bullets = []
        self.shoot_timer = 0
        self.shoot_interval = 1000
        
        # 碰撞矩形
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
    
    def update(self):
        """更新敌机状态"""
        self.y += self.speed
        self.rect.topleft = (self.x, self.y)
        
        # 更新子弹
        for bullet in self.bullets[:]:
            bullet.update()
            if bullet.y > SCREEN_HEIGHT:
                self.bullets.remove(bullet)
    
    def take_damage(self, damage):
        """受到伤害"""
        self.health -= damage
    
    def draw(self, screen):
        """绘制敌机"""
        pass
    
    def shoot(self):
        """射击"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > self.shoot_interval:
            bullet = Bullet(self.x + self.width // 2 - 2, self.y + self.height, 5, 4, 8, RED, 1)
            self.bullets.append(bullet)
            self.shoot_timer = current_time


class SmallScout(Enemy):
    """小型侦察机"""
    
    def __init__(self, x, y):
        super().__init__(x, y, 30, 25, 4, 1, 100)
        self.shoot_interval = 1500
        self.move_pattern = "sin"
        self.move_timer = 0
        self.amplitude = 2  # 正弦波幅度
        self.frequency = 0.02  # 正弦波频率
        self.original_x = x
    
    def update(self):
        """更新侦察机状态"""
        self.move_timer += 1
        
        # 正弦波移动
        if self.move_pattern == "sin":
            self.x = self.original_x + math.sin(self.move_timer * self.frequency) * self.amplitude * self.speed
        
        super().update()
        
        # 随机射击
        if random.random() < 0.01:
            self.shoot()
    
    def draw(self, screen):
        """绘制侦察机"""
        # 主体
        pygame.draw.polygon(screen, (255, 50, 50), [
            (self.x + self.width // 2, self.y),
            (self.x, self.y + self.height),
            (self.x + self.width, self.y + self.height)
        ])
        
        # 机翼
        pygame.draw.line(screen, (200, 50, 50), 
                        (self.x, self.y + 10), (self.x - 10, self.y + 15), 2)
        pygame.draw.line(screen, (200, 50, 50), 
                        (self.x + self.width, self.y + 10), (self.x + self.width + 10, self.y + 15), 2)
        
        # 驾驶舱
        pygame.draw.circle(screen, (255, 255, 255), 
                          (self.x + self.width // 2, self.y + 8), 3)


class MediumFrigate(Enemy):
    """中型护卫舰"""
    
    def __init__(self, x, y):
        super().__init__(x, y, 50, 40, 2, 3, 300)
        self.shoot_interval = 800
        self.move_pattern = "straight"
    
    def update(self):
        """更新护卫舰状态"""
        super().update()
        
        # 定期射击
        self.shoot()
    
    def shoot(self):
        """射击（小型弹幕）"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > self.shoot_interval:
            # 发射三发子弹
            for i in range(-1, 2):
                bullet = Bullet(self.x + self.width // 2 - 2 + i * 10, self.y + self.height, 6, 4, 8, RED, 1)
                self.bullets.append(bullet)
            self.shoot_timer = current_time
    
    def draw(self, screen):
        """绘制护卫舰"""
        # 主体
        pygame.draw.rect(screen, (50, 100, 255), 
                       (self.x, self.y, self.width, self.height))
        
        # 船头
        pygame.draw.polygon(screen, (50, 100, 255), [
            (self.x + self.width // 2, self.y),
            (self.x + 10, self.y + 10),
            (self.x + self.width - 10, self.y + 10)
        ])
        
        # 武器
        pygame.draw.rect(screen, (100, 100, 100), 
                       (self.x + 10, self.y + 20, 8, 15))
        pygame.draw.rect(screen, (100, 100, 100), 
                       (self.x + self.width - 18, self.y + 20, 8, 15))
        
        # 装甲板
        pygame.draw.rect(screen, (80, 80, 80), 
                       (self.x + 5, self.y + 5, self.width - 10, 5))
        pygame.draw.rect(screen, (80, 80, 80), 
                       (self.x + 5, self.y + 15, self.width - 10, 5))


class Meteor(Enemy):
    """太空陨石"""
    
    def __init__(self, x, y):
        super().__init__(x, y, random.randint(25, 45), random.randint(25, 45), 
                        random.uniform(1, 3), 1, 150)
        self.rotation = 0
        self.rotation_speed = random.uniform(-1, 1)
        self.shape = self.generate_random_shape()
    
    def generate_random_shape(self):
        """生成随机形状"""
        points = []
        sides = random.randint(5, 8)
        
        for i in range(sides):
            angle = (i / sides) * math.pi * 2
            radius = random.randint(self.width // 2 - 5, self.width // 2 + 5)
            x = radius * math.cos(angle)
            y = radius * math.sin(angle)
            points.append((x, y))
        
        return points
    
    def update(self):
        """更新陨石状态"""
        super().update()
        self.rotation += self.rotation_speed
    
    def draw(self, screen):
        """绘制陨石"""
        # 旋转并绘制多边形
        rotated_points = []
        center_x = self.x + self.width // 2
        center_y = self.y + self.height // 2
        
        for px, py in self.shape:
            # 旋转点
            new_px = px * math.cos(math.radians(self.rotation)) - py * math.sin(math.radians(self.rotation))
            new_py = px * math.sin(math.radians(self.rotation)) + py * math.cos(math.radians(self.rotation))
            
            # 平移到屏幕位置
            rotated_points.append((center_x + new_px, center_y + new_py))
        
        # 绘制陨石
        pygame.draw.polygon(screen, (100, 100, 100), rotated_points)
        
        # 添加纹理
        for _ in range(3):
            tx = self.x + random.randint(5, self.width - 10)
            ty = self.y + random.randint(5, self.height - 10)
            pygame.draw.circle(screen, (80, 80, 80), (tx, ty), random.randint(2, 5))


class Boss(Enemy):
    """关卡Boss"""
    
    def __init__(self, x, y, level):
        # 根据关卡计算生命值
        base_health = 40
        health = int(base_health * (1.15 ** (level - 1)))
        
        super().__init__(x, y, 200, 150, 2, health, 1000)
        self.level = level
        self.shoot_interval = 500
        self.phase = 1
        self.move_timer = 0
        self.move_pattern = "sin"
        self.original_x = x
        
        # 多阶段攻击模式
        self.attack_patterns = [
            self.attack_pattern_1,
            self.attack_pattern_2,
            self.attack_pattern_3
        ]
        self.current_attack = 0
        self.attack_timer = 0
        self.attack_duration = 3000  # 每个攻击模式持续3秒
    
    def update(self):
        """更新Boss状态"""
        self.move_timer += 1
        current_time = pygame.time.get_ticks()
        
        # Boss移动
        if self.move_pattern == "sin":
            self.x = self.original_x + math.sin(self.move_timer * 0.01) * 50
        
        super().update()
        
        # 攻击模式切换
        if current_time - self.attack_timer > self.attack_duration:
            self.current_attack = (self.current_attack + 1) % len(self.attack_patterns)
            self.attack_timer = current_time
        
        # 执行当前攻击模式
        self.attack_patterns[self.current_attack]()
    
    def attack_pattern_1(self):
        """攻击模式1：直线射击"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > self.shoot_interval:
            # 中间发射
            bullet = Bullet(self.x + self.width // 2 - 2, self.y + self.height, 6, 4, 10, RED, 1)
            self.bullets.append(bullet)
            
            self.shoot_timer = current_time
    
    def attack_pattern_2(self):
        """攻击模式2：扇形射击"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > self.shoot_interval:
            angle_step = 15
            for angle in range(-45, 46, angle_step):
                rad = math.radians(angle)
                speed = 6
                bullet_speed_x = math.sin(rad) * speed
                bullet_speed_y = math.cos(rad) * speed
                
                bullet = Bullet(self.x + self.width // 2 - 2, self.y + self.height, 
                              bullet_speed_y, 4, 8, RED, 1)
                bullet.x_speed = bullet_speed_x
                self.bullets.append(bullet)
            
            self.shoot_timer = current_time
    
    def attack_pattern_3(self):
        """攻击模式3：弹幕射击"""
        current_time = pygame.time.get_ticks()
        
        if current_time - self.shoot_timer > 300:
            # 三方向射击
            for offset in [-40, 0, 40]:
                bullet = Bullet(self.x + self.width // 2 - 2 + offset, self.y + self.height, 5, 4, 8, RED, 1)
                self.bullets.append(bullet)
            
            self.shoot_timer = current_time
    
    def draw(self, screen):
        """绘制Boss"""
        # Boss主体
        pygame.draw.rect(screen, (150, 50, 255), 
                       (self.x, self.y, self.width, self.height))
        
        # 头部
        pygame.draw.rect(screen, (200, 100, 255), 
                       (self.x + 30, self.y, self.width - 60, 40))
        
        # 武器炮台
        pygame.draw.rect(screen, (100, 100, 100), 
                       (self.x + 50, self.y + 60, 20, 30))
        pygame.draw.rect(screen, (100, 100, 100), 
                       (self.x + self.width - 70, self.y + 60, 20, 30))
        pygame.draw.rect(screen, (100, 100, 100), 
                       (self.x + self.width // 2 - 10, self.y + 80, 20, 40))
        
        # 发光核心
        pygame.draw.circle(screen, (255, 100, 100), 
                          (self.x + self.width // 2, self.y + self.height // 2), 20)
        pygame.draw.circle(screen, (255, 200, 200), 
                          (self.x + self.width // 2, self.y + self.height // 2), 10)
        
        # 装饰
        for i in range(5):
            pygame.draw.rect(screen, (100, 50, 200), 
                           (self.x + 10 + i * 38, self.y + 30, 20, 5))


class PowerUp:
    """道具类"""
    
    def __init__(self, x, y, power_type):
        self.x = x
        self.y = y
        self.width = 20
        self.height = 20
        self.speed = 3
        self.type = power_type
        self.animation_timer = 0
        
        # 碰撞矩形
        self.rect = pygame.Rect(self.x, self.y, self.width, self.height)
        
        # 道具颜色
        self.colors = {
            "bullet": (255, 255, 0),  # 黄色
            "bomb": (255, 100, 100)    # 红色
        }
    
    def update(self):
        """更新道具状态"""
        self.y += self.speed
        self.animation_timer += 1
        self.rect.topleft = (self.x, self.y)
    
    def draw(self, screen):
        """绘制道具"""
        color = self.colors.get(self.type, WHITE)
        
        # 闪烁效果
        alpha = 255 if self.animation_timer % 100 < 50 else 150
        
        # 绘制道具
        if self.type == "bullet":
            # 子弹增强道具：发光的能量核心
            pygame.draw.circle(screen, color, 
                              (self.x + self.width // 2, self.y + self.height // 2), 
                              self.width // 2)
            
            # 能量光环
            glow_radius = self.width // 2 + 5
            pygame.draw.circle(screen, (color[0], color[1], color[2], alpha), 
                              (self.x + self.width // 2, self.y + self.height // 2), 
                              glow_radius, 2)
        
        elif self.type == "bomb":
            # 全屏轰炸道具：核弹图标
            pygame.draw.rect(screen, color, 
                           (self.x, self.y, self.width, self.height))
            
            # 核弹标志
            pygame.draw.line(screen, BLACK, 
                           (self.x + 5, self.y + 5), 
                           (self.x + self.width - 5, self.y + self.height - 5), 2)
            pygame.draw.line(screen, BLACK, 
                           (self.x + self.width - 5, self.y + 5), 
                           (self.x + 5, self.y + self.height - 5), 2)


class Particle:
    """粒子效果类"""
    
    def __init__(self, x, y, size, color, speed_x, speed_y, life):
        self.x = x
        self.y = y
        self.size = size
        self.color = color
        self.speed_x = speed_x
        self.speed_y = speed_y
        self.life = life
        self.max_life = life
        
        # 重力
        self.gravity = 0.1
    
    def update(self):
        """更新粒子状态"""
        self.x += self.speed_x
        self.y += self.speed_y
        self.speed_y += self.gravity
        self.life -= 1
    
    def draw(self, screen):
        """绘制粒子"""
        if self.life > 0:
            alpha = int(255 * (self.life / self.max_life))
            color = (self.color[0], self.color[1], self.color[2], alpha)
            
            pygame.draw.circle(screen, color, (int(self.x), int(self.y)), self.size)


class Background:
    """游戏背景类"""
    
    def __init__(self):
        self.stars = []
        self.planets = []
        self.speed = 1
        
        # 创建星星
        self.create_stars(100)
        
        # 创建行星
        self.create_planets(3)
    
    def create_stars(self, count):
        """创建星星"""
        for _ in range(count):
            star = {
                "x": random.randint(0, SCREEN_WIDTH),
                "y": random.randint(0, SCREEN_HEIGHT),
                "size": random.randint(1, 3),
                "speed": random.uniform(0.5, 2.0),
                "color": (random.randint(100, 255), random.randint(100, 255), random.randint(100, 255))
            }
            self.stars.append(star)
    
    def create_planets(self, count):
        """创建行星"""
        for _ in range(count):
            planet = {
                "x": random.randint(0, SCREEN_WIDTH),
                "y": random.randint(-200, -50),
                "size": random.randint(20, 50),
                "speed": random.uniform(0.1, 0.3),
                "color": (random.randint(100, 200), random.randint(100, 200), random.randint(100, 200))
            }
            self.planets.append(planet)
    
    def update(self):
        """更新背景"""
        # 更新星星
        for star in self.stars:
            star["y"] += star["speed"]
            
            # 星星移出屏幕底部，重新从顶部生成
            if star["y"] > SCREEN_HEIGHT:
                star["y"] = -5
                star["x"] = random.randint(0, SCREEN_WIDTH)
        
        # 更新行星
        for planet in self.planets:
            planet["y"] += planet["speed"]
            
            # 行星移出屏幕底部，重新从顶部生成
            if planet["y"] > SCREEN_HEIGHT + 100:
                planet["y"] = -100
                planet["x"] = random.randint(0, SCREEN_WIDTH)
                planet["size"] = random.randint(20, 50)
    
    def draw(self, screen):
        """绘制背景"""
        # 深黑色背景
        screen.fill((0, 0, 20))
        
        # 绘制星星
        for star in self.stars:
            pygame.draw.circle(screen, star["color"], 
                              (int(star["x"]), int(star["y"])), 
                              star["size"])
        
        # 绘制行星
        for planet in self.planets:
            # 行星本体
            pygame.draw.circle(screen, planet["color"], 
                              (int(planet["x"]), int(planet["y"])), 
                              planet["size"])
            
            # 行星光晕
            glow_radius = planet["size"] + 10
            pygame.draw.circle(screen, (planet["color"][0], planet["color"][1], planet["color"][2], 50), 
                              (int(planet["x"]), int(planet["y"])), 
                              glow_radius, 2)


class Particle:
    """粒子效果类"""
    
    def __init__(self, x, y, size, color, speed_x, speed_y, life):
        self.x = x
        self.y = y
        self.size = size
        self.color = color
        self.speed_x = speed_x
        self.speed_y = speed_y
        self.life = life
        self.max_life = life
        self.gravity = 0.1
    
    def update(self):
        """更新粒子状态"""
        self.x += self.speed_x
        self.y += self.speed_y
        self.speed_y += self.gravity
        self.life -= 1
    
    def draw(self, screen):
        """绘制粒子"""
        if self.life > 0:
            alpha = int(255 * (self.life / self.max_life))
            color = (self.color[0], self.color[1], self.color[2], alpha)
            
            # 创建半透明表面
            surf = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
            pygame.draw.circle(surf, color, (self.size, self.size), self.size)
            screen.blit(surf, (self.x - self.size, self.y - self.size))


if __name__ == "__main__":
    game = StarDefender()
    game.run()