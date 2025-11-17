// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 监听滚动事件，添加滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    document.querySelectorAll('.feature-card, .compatibility-card, .testimonial-card, .faq-item').forEach(card => {
        observer.observe(card);
    });

    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // 向下滚动，隐藏导航栏
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // 向上滚动，显示导航栏
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // FAQ 展开/折叠功能
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // 语言选择器功能
    const languageSelector = document.querySelector('.language-selector');
    const langDropdown = document.querySelector('.lang-dropdown');
    const currentLang = document.querySelector('.current-lang');
    const langLinks = document.querySelectorAll('.lang-dropdown a');
    
    // 点击语言选择器外部关闭下拉菜单
    document.addEventListener('click', (e) => {
        if (!languageSelector.contains(e.target)) {
            langDropdown.style.opacity = '0';
            langDropdown.style.visibility = 'hidden';
            langDropdown.style.transform = 'translateY(-10px)';
        }
    });
    
    // 语言切换功能
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            const langText = link.textContent;
            
            // 更新当前语言显示
            currentLang.innerHTML = `
                <span class="flag-icon">🌐</span>
                <span class="lang-text">${langText}</span>
                <span class="lang-arrow">▼</span>
            `;
            
            // 关闭下拉菜单
            langDropdown.style.opacity = '0';
            langDropdown.style.visibility = 'hidden';
            langDropdown.style.transform = 'translateY(-10px)';
            
            // 这里可以添加语言切换的逻辑
            console.log(`切换语言到: ${lang}`);
            
            // 模拟语言切换效果
            alert(`切换语言到${langText}`);
        });
    });

    // 下载按钮点击效果
    const downloadButtons = document.querySelectorAll('.btn-primary[data-download]');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const downloadType = button.getAttribute('data-download');
            console.log(`开始下载${downloadType}`);
            
            // 模拟下载过程
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 下载中...';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-check"></i> 下载完成';
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-download"></i> 下载 APK';
                    button.disabled = false;
                }, 2000);
            }, 3000);
        });
    });

    // 社交媒体链接点击效果
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = link.getAttribute('data-platform');
            console.log(`访问社交媒体: ${platform}`);
            
            // 模拟跳转效果
            alert(`即将跳转到${platform}官方页面`);
        });
    });

    // 导航栏链接激活状态
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset + 100;
        
        navLinks.forEach(link => {
            const section = document.querySelector(link.getAttribute('href'));
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navLinks.forEach(l => l.parentElement.classList.remove('active'));
                    link.parentElement.classList.add('active');
                }
            }
        });
    });
});

// 表单验证功能
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            input.parentElement.querySelector('.error-message')?.remove();
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '此项为必填项';
            errorMsg.style.color = 'red';
            errorMsg.style.fontSize = '0.8rem';
            errorMsg.style.marginTop = '0.3rem';
            
            input.parentElement.appendChild(errorMsg);
        } else {
            input.classList.remove('error');
            input.parentElement.querySelector('.error-message')?.remove();
        }
    });

    // 邮箱格式验证
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            isValid = false;
            emailInput.classList.add('error');
            emailInput.parentElement.querySelector('.error-message')?.remove();
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '请输入有效的邮箱地址';
            errorMsg.style.color = 'red';
            errorMsg.style.fontSize = '0.8rem';
            errorMsg.style.marginTop = '0.3rem';
            
            emailInput.parentElement.appendChild(errorMsg);
        } else {
            emailInput.classList.remove('error');
            emailInput.parentElement.querySelector('.error-message')?.remove();
        }
    }

    // 手机号格式验证
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
            isValid = false;
            phoneInput.classList.add('error');
            phoneInput.parentElement.querySelector('.error-message')?.remove();
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = '请输入有效的手机号';
            errorMsg.style.color = 'red';
            errorMsg.style.fontSize = '0.8rem';
            errorMsg.style.marginTop = '0.3rem';
            
            phoneInput.parentElement.appendChild(errorMsg);
        } else {
            phoneInput.classList.remove('error');
            phoneInput.parentElement.querySelector('.error-message')?.remove();
        }
    }

    return isValid;
}

// 发送表单数据
function submitForm(formId, successCallback) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(formId)) {
            // 收集表单数据
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // 模拟API请求
            console.log('表单数据:', data);
            
            // 显示成功信息
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = '提交成功！';
            successMsg.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
            successMsg.style.border = '1px solid rgba(37, 99, 235, 0.5)';
            successMsg.style.color = '#2563EB';
            successMsg.style.padding = '1rem';
            successMsg.style.borderRadius = '8px';
            successMsg.style.marginTop = '1rem';
            
            form.appendChild(successMsg);
            
            // 重置表单
            form.reset();
            
            // 调用回调函数
            if (successCallback) successCallback();
            
            // 3秒后移除成功信息
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
    });
}

// 导出函数（如果需要模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        submitForm
    };
}