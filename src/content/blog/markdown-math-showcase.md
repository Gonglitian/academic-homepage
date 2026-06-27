---
title: "Markdown × KaTeX 全功能展示"
description: "演示 Astro 博客支持的所有 Markdown 格式与 KaTeX 数学公式渲染——标题、列表、表格、代码块、引用、公式编号、矩阵、多行对齐等。"
date: 2026-06-24
tags: [markdown, katex, showcase, math, sidenotes]
math: true
references:
  - id: degroot2012
    text: "M. H. DeGroot and M. J. Schervish, *Probability and Statistics*, 4th ed. Pearson, 2012."
  - id: rice2006
    text: "J. A. Rice, *Mathematical Statistics and Data Analysis*, 3rd ed. Duxbury Press, 2006."
  - id: gauss1809
    text: "C. F. Gauss, “Theoria motus corporum coelestium in sectionibus conicis solem ambientium,” *Werke*, vol. 7, pp. 1–280, 1809."
  - id: stigler1982
    text: "S. M. Stigler, “A modest proposal: A new standard for the normal,” *The American Statistician*, vol. 36, no. 2, pp. 137–138, 1982."
---

## 0. 脚注/边注 (Sidenotes)

这是正文中的第一个脚注引用[^1]。这是第二个，包含更多技术细节[^2]。这是第三个，简短的评论[^3]。

[^1]: **AutoFocus-IL** 使用 VLM（具体为 GPT-4o）自动识别演示视频中的关键物体并生成时间显著性图，无需人工标注眼动数据。该方法在 CARLA 仿真和真机 WidowX 实验中均超越了需要人工监督的 SOTA 方法。

[^2]: 在标准 Behavior Cloning 中，损失函数为 $\mathcal{L}_{\text{BC}} = \frac{1}{N} \sum_i \| a_i - \pi_\theta(o_i) \|^2$。AutoFocus-IL 将其扩展为显著性加权版本 $\mathcal{L} = \frac{1}{N} \sum_i \sum_{p \in \Omega} M_i(p) \cdot \| a_i - \pi_\theta(o_i) \|^2$，使策略更关注任务相关区域。

[^3]: 本文提出的架构在 ICRA 2026 接收。

## 0.5 文献引用 (Citations)

The normal distribution, often called the Gaussian distribution or bell curve, is one of the most fundamental concepts in statistics and probability theory [@degroot2012]. Its characteristic symmetric, bell-shaped curve appears throughout nature and human activity, from heights and test scores to measurement errors and biological variations [@rice2006].

正文中用 `[@id]` 引用，文末自动生成编号参考文献（Bibliography）。也支持一处多引 [@gauss1809; @stigler1982]，编号顺序与 frontmatter 中 `references` 的声明顺序一致。点击正文里的 [@degroot2012] 可跳到文末，点文末的 `[1]` 可跳回正文。

## 1. 标题层级

### H3 三级标题

#### H4 四级标题

正文段落。这是**加粗**，这是*斜体*，这是~~删除线~~，这是`行内代码`。这是[超链接](https://arxiv.org)。

---

## 2. 列表

### 无序列表

- 机器人学习三大方向
  - 模仿学习 (Imitation Learning)
  - 强化学习 (Reinforcement Learning)
  - 视觉-语言-动作模型 (VLA)
- 仿真平台
  - Isaac Sim / Isaac Lab
  - RoboCasa / LIBERO
  - MuJoCo / MotrixSim

### 有序列表

1. 收集演示数据 $\mathcal{D} = \{(o_i, a_i)\}_{i=1}^N$
2. 训练策略 $\pi_\theta$
3. 仿真评估 → 真机部署

### 任务列表

- [x] 数据采集 pipeline 搭建
- [x] Behavior Cloning baseline
- [ ] Diffusion Policy 训练
- [ ] Real-robot transfer

---

## 3. 引用

> **核心洞察**：VLM 的视觉理解能力可以自动为模仿学习提供显著性监督，无需人工标注眼动数据。
>
> — AutoFocus-IL 论文摘要, ICRA 2026

嵌套引用：

> 机器人学习的第一性原理
>> **数据驱动 + 仿真迁移** 是当前最优路径
>>> 但真机数据的价值不可替代

---

## 4. 表格

### 论文发表汇总

| 论文 | 会议 | 年份 | 类型 |
|------|------|------|------|
| AutoFocus-IL | ICRA | 2026 | VLM + Imitation Learning |
| ORIC | CVPR | 2026 | VLM Benchmarking |
| DynaMem | CoRL | 2026 | Memory-Augmented VLA |
| EvoMoE | *In Prep.* | 2026 | Continual MoE for VLA |

### 对齐方式

| 左对齐 | 居中 | 右对齐 |
|:-------|:----:|-------:|
| `imitation` | `learning` | `0.85` |
| `reinforcement` | `from` | `0.72` |
| `human` | `feedback` | `0.91` |

---

## 5. 代码块

### Python

```python
import torch
import torch.nn.functional as F

def behavior_cloning_loss(
    pred_actions: torch.Tensor,
    expert_actions: torch.Tensor,
    saliency_map: torch.Tensor | None = None
) -> torch.Tensor:
    """AutoFocus-IL: saliency-weighted BC loss."""
    mse = F.mse_loss(pred_actions, expert_actions, reduction='none')
    if saliency_map is not None:
        mse = mse * saliency_map.unsqueeze(-1)  # Eq. (5)
    return mse.mean()
```

### Bash

```bash
#!/bin/bash
# 训练启动脚本
ACCELERATE_LOG_LEVEL=info accelerate launch \
    --num_processes=4 \
    --mixed_precision=bf16 \
    train.py \
    --model pi05_base \
    --dataset robocasa-365 \
    --batch_size 256 \
    --lr 3e-4
```

### YAML 配置

```yaml
# astro.config.mjs 等效配置
markdown:
  remarkPlugins:
    - remark-math
  rehypePlugins:
    - rehype-katex
```

---

## 6. 行内公式

行内公式示例：策略梯度 $\nabla_\theta J(\theta) = \mathbb{E}_\pi \left[ \nabla_\theta \log \pi_\theta(a|s) \, Q^\pi(s,a) \right]$。再比如状态值函数 $V^\pi(s) = \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t r_t \mid s_0 = s \right]$。

常见符号：$\mu, \sigma, \theta, \phi, \pi, \alpha, \beta, \gamma, \epsilon, \lambda, \tau, \omega, \nabla, \partial, \sum, \prod, \int, \infty, \approx, \propto, \sim, \mathcal{N}, \mathcal{L}, \mathbb{E}, \mathbb{R}$。

---

## 7. 独立公式 + 编号

### 策略梯度定理

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t \mid s_t) \, \hat{A}_t \right] \tag{1}
$$

其中 $\hat{A}_t$ 是优势函数估计（GAE）：

$$
\hat{A}_t = \sum_{l=0}^{\infty} (\gamma \lambda)^l \delta_{t+l}, \quad \delta_t = r_t + \gamma V(s_{t+1}) - V(s_t) \tag{2}
$$

### Diffusion Policy 损失

$$
\mathcal{L}_{\text{diff}}(\theta) = \mathbb{E}_{\epsilon, t, \mathbf{a}_0} \left[ \| \epsilon - \epsilon_\theta(\mathbf{a}_t, t, \mathbf{s}) \|^2 \right] \tag{3}
$$

### VLA 记忆模块 (DynaMem)

$$
\mathbf{m}_t = \text{GRU}_\phi(\mathbf{z}_t, \mathbf{m}_{t-1}), \quad \mathbf{z}_t = f_\psi(\mathbf{v}_t, \mathbf{q}_t) \tag{4}
$$

$$
a_t = g_\omega(\mathbf{m}_t, \mathbf{o}_t) \tag{5}
$$

### KL 散度正则化

$$
D_{\text{KL}}(p \parallel q) = \sum_x p(x) \log \frac{p(x)}{q(x)} \tag{6}
$$

---

## 8. 矩阵

### 协方差矩阵

$$
\Sigma = \begin{bmatrix}
\sigma_{xx} & \sigma_{xy} & \sigma_{xz} \\
\sigma_{yx} & \sigma_{yy} & \sigma_{yz} \\
\sigma_{zx} & \sigma_{zy} & \sigma_{zz}
\end{bmatrix} \tag{7}
$$

### 旋转矩阵 (SO(3))

$$
R_x(\theta) = \begin{bmatrix}
1 & 0 & 0 \\
0 & \cos\theta & -\sin\theta \\
0 & \sin\theta & \cos\theta
\end{bmatrix}, \quad
R_y(\theta) = \begin{bmatrix}
\cos\theta & 0 & \sin\theta \\
0 & 1 & 0 \\
-\sin\theta & 0 & \cos\theta
\end{bmatrix} \tag{8}
$$

### 大矩阵

$$
\begin{bmatrix}
K_{11} & K_{12} & \cdots & K_{1n} \\
K_{21} & K_{22} & \cdots & K_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
K_{n1} & K_{n2} & \cdots & K_{nn}
\end{bmatrix}
\begin{bmatrix}
w_1 \\ w_2 \\ \vdots \\ w_n
\end{bmatrix}
=
\begin{bmatrix}
y_1 \\ y_2 \\ \vdots \\ y_n
\end{bmatrix} \tag{9}
$$

---

## 9. 多行对齐公式

$$
\begin{aligned}
\mathcal{L}_{\text{total}} &= \mathcal{L}_{\text{BC}} + \lambda_1 \mathcal{L}_{\text{saliency}} + \lambda_2 \mathcal{L}_{\text{reg}} \\[4pt]
\mathcal{L}_{\text{BC}} &= \frac{1}{N} \sum_{i=1}^N \| a_i - \pi_\theta(o_i) \|^2 \\[4pt]
\mathcal{L}_{\text{saliency}} &= \frac{1}{N} \sum_{i=1}^N \sum_{p \in \Omega} M_i(p) \cdot \| \nabla \pi_\theta(o_i)_p \|^2 \tag{10}
\end{aligned}
$$

---

## 10. 分段函数

$$
f(x) = \begin{cases}
0 & \text{if } x < 0 \\
x^2 & \text{if } 0 \leq x < 1 \\
2x - 1 & \text{if } x \geq 1
\end{cases} \tag{11}
$$

---

## 11. 公式引用

如公式 $(1)$ 所示，策略梯度的核心是优势加权。公式 $(3)$ 定义了扩散损失，公式 $(10)$ 给出 AutoFocus-IL 的总损失函数——它在标准 BC 基础上增加了显著性引导项。

对比 $(6)$ 和 $(3)$：KL 散度衡量分布差异，而扩散损失衡量噪声预测误差——两者在变分推断框架下有深层关联：

$$
\mathcal{L}_{\text{ELBO}} = \mathbb{E}_q \left[ -\log p_\theta(x|z) \right] + D_{\text{KL}}(q_\phi(z|x) \parallel p(z)) \tag{12}
$$

---

## 12. 综合示例：AutoFocus-IL 方法

### 问题形式化

给定演示数据集 $\mathcal{D} = \{(o_i, a_i)\}_{i=1}^N$，其中 $o_i \in \mathbb{R}^{H \times W \times 3}$ 为观测图像，$a_i \in \mathbb{R}^d$ 为专家动作。

VLM 生成显著性图：

$$
M(o) = \text{VLM}(o, \text{prompt}) \in [0, 1]^{H \times W} \tag{13}
$$

显著性加权的 BC 损失：

$$
\mathcal{L}(\theta) = \frac{1}{N} \sum_{i=1}^N \sum_{p \in \Omega} M_i(p) \cdot \| a_i - \pi_\theta(o_i) \|^2 + \lambda \| \theta \|_2^2 \tag{14}
$$

### 实验结果

| 方法 | CARLA (Success %) | WidowX (Success %) |
|------|-------------------|---------------------|
| BC (baseline) | $42.3 \pm 3.1$ | $38.7 \pm 4.2$ |
| BC + Gaze | $61.5 \pm 2.8$ | $55.2 \pm 3.6$ |
| BC + GradCAM | $54.8 \pm 3.3$ | $47.1 \pm 4.0$ |
| **AutoFocus-IL** | **$\mathbf{67.2 \pm 2.1}$** | **$\mathbf{60.8 \pm 3.0}$** |

> AutoFocus-IL **无需人工标注**即超越了需要眼动数据监督的 SOTA 方法。

---

## 13. 分隔线

---

以上就是 Astro + KaTeX 博客的全部 Markdown 渲染能力演示。

**总结**：支持标准 Markdown（标题/列表/表格/代码/引用），**KaTeX 公式渲染**（行内 + 独立 + `\tag{n}` 编号 + 矩阵 + 多行对齐 + 分段函数 + `\ref` 交叉引用），以及 **深色模式自动适配** ✨

---

*如果你看到所有公式都正确渲染、表格对齐、代码高亮正常——恭喜，你的 Astro 学术博客已经完全就绪！*
