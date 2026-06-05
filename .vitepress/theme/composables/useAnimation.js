/**
 * 动画相关 Composable
 * 处理页面各种动画效果
 */

import { ref, onMounted, onUnmounted } from "vue";
import { useThrottle, useIntersectionObserver, useEasing } from "./useUtils";

/**
 * 数字计数动画
 */
export function useCounterAnimation() {
  const { easeOutQuart } = useEasing();
  const { createObserver } = useIntersectionObserver();

  const animatedCounters = new Set();

  const animateCounter = (element, target, duration = 2000) => {
    if (animatedCounters.has(element)) return;

    animatedCounters.add(element);
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

      element.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(animate);
  };

  const observeCounters = (selectors) => {
    const counters = document.querySelectorAll(selectors);

    const observer = createObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedCounters.has(entry.target)) {
            const target = parseInt(entry.target.getAttribute("data-count") || "0", 10);
            animateCounter(entry.target, target);
          }
        });
      },
      { threshold: 0.5 },
    );

    if (observer) {
      counters.forEach((counter) => observer.observe(counter));
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  };

  return {
    animateCounter,
    observeCounters,
  };
}

/**
 * 文字轮播动画
 */
export function useTextRotation() {
  const currentIndex = ref(0);
  const intervalId = ref(null);

  const startRotation = (selectors, interval = 2500) => {
    const textElements = document.querySelectorAll(selectors);
    if (textElements.length === 0) return;

    // 初始化状态
    resetAllTexts(textElements);
    showText(textElements, 0);

    intervalId.value = window.setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % textElements.length;
      showText(textElements, currentIndex.value);
    }, interval);
  };

  const resetAllTexts = (elements) => {
    elements.forEach((text) => {
      text.removeAttribute("data-show");
      text.removeAttribute("data-up");
      text.classList.remove("first-tips");
      text.style.transform = "translateY(0px)";
      text.style.transition = "";
    });
  };

  const showText = (elements, index) => {
    if (index >= elements.length) return;

    elements.forEach((text, i) => {
      if (i === index) {
        // 当前显示的文字：从下方滑入
        text.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        text.style.transform = "translateY(-100%)";
        text.classList.add("first-tips");
      } else if (i === (index - 1 + elements.length) % elements.length) {
        // 上一个文字：向上滑出
        text.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        text.style.transform = "translateY(-200%)";
        text.classList.remove("first-tips");
      } else {
        // 其他文字：隐藏在下方
        text.style.transition = "transform 0.3s ease";
        text.style.transform = "translateY(0px)";
        text.classList.remove("first-tips");
      }
    });
  };

  const stopRotation = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = null;
    }
  };

  onUnmounted(() => {
    stopRotation();
  });

  return {
    startRotation,
    stopRotation,
    currentIndex,
  };
}

/**
 * 鼠标跟踪动画
 */
export function useMouseTracking() {
  const isActive = ref(false);

  const setupMouseTracking = (containerSelector, cursorSelector, shapesSelector) => {
    const container = document.querySelector(containerSelector);
    const cursor = document.querySelector(cursorSelector);
    const shapes = document.querySelectorAll(shapesSelector);

    if (!container || !cursor || shapes.length === 0) return;

    // 仅在非移动端启用
    if (window.innerWidth <= 768) return;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - 10;
      const y = event.clientY - rect.top - 10;

      // 设置cursor位置
      cursor.style.transform = `translate(${x}px, ${y}px)`;

      // 设置shapes位置（带延迟效果）
      shapes.forEach((shape, index) => {
        setTimeout(() => {
          shape.style.transform = `translate(${x}px, ${y}px)`;
        }, index * 100);
      });
    };

    const handleMouseLeave = () => {
      cursor.style.transform = "translate(50%, 50%)";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    isActive.value = true;

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      isActive.value = false;
    };
  };

  return {
    setupMouseTracking,
    isActive,
  };
}

/**
 * 滚动动画
 */
export function useScrollAnimation() {
  const { createObserver } = useIntersectionObserver();

  const setupScrollReveal = (selector, options = {}) => {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
      ...options,
    };

    const elements = document.querySelectorAll(selector);

    const observer = createObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    }, defaultOptions);

    if (observer) {
      elements.forEach((el) => {
        el.classList.add("reveal");
        observer.observe(el);
      });
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  };

  return {
    setupScrollReveal,
  };
}

/**
 * 悬停动画效果
 */
export function useHoverEffects() {
  const setupCardHover = (selector) => {
    const cards = document.querySelectorAll(selector);

    const handleMouseEnter = (card) => {
      card.style.transition = "all 0.3s ease";
      card.style.transform = "translateY(-2px)";
    };

    const handleMouseLeave = (card) => {
      card.style.transform = "translateY(0px)";
    };

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => handleMouseEnter(card));
      card.addEventListener("mouseleave", () => handleMouseLeave(card));
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mouseenter", () => handleMouseEnter(card));
        card.removeEventListener("mouseleave", () => handleMouseLeave(card));
      });
    };
  };

  const setupIconHover = (selector) => {
    const icons = document.querySelectorAll(selector);

    const handleMouseEnter = (icon) => {
      icon.style.transform = "translateY(-5px) scale(1.1) rotate(5deg)";
      icon.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.3)";
    };

    const handleMouseLeave = (icon) => {
      icon.style.transform = "";
      icon.style.boxShadow = "";
    };

    icons.forEach((icon) => {
      icon.addEventListener("mouseenter", () => handleMouseEnter(icon));
      icon.addEventListener("mouseleave", () => handleMouseLeave(icon));
    });

    return () => {
      icons.forEach((icon) => {
        icon.removeEventListener("mouseenter", () => handleMouseEnter(icon));
        icon.removeEventListener("mouseleave", () => handleMouseLeave(icon));
      });
    };
  };

  return {
    setupCardHover,
    setupIconHover,
  };
}
