---
title: "A Demo Post with Math Equations"
description: "This post demonstrates KaTeX math rendering with equation numbering in Astro."
date: 2026-06-20
tags: [demo, math, astro]
math: true
---

## Introduction

This post shows how KaTeX renders mathematical equations in your Astro blog. All standard $\LaTeX$ commands work out of the box.

## Inline Math

You can write inline equations like $\pi \approx 3.14159$ or the policy gradient $\nabla_\theta J(\theta) = \mathbb{E}_\pi[\nabla_\theta \log \pi_\theta(a|s) Q^\pi(s,a)]$.

## Display Math with Numbering

### Policy Gradient Theorem

The fundamental policy gradient theorem:

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t | s_t) \, R(\tau) \right] \tag{1}
$$

### 3D Diffusion Policy

Our 3D diffusion policy formulation:

$$
\mathcal{L}_{\text{diff}} = \mathbb{E}_{\epsilon, t, \mathbf{a}_0} \left[ \| \epsilon - \epsilon_\theta(\mathbf{a}_t, t, \mathbf{s}_{\text{3D}}) \|^2 \right] \tag{2}
$$

where $\mathbf{s}_{\text{3D}}$ is the 3D visual representation extracted from point cloud observations.

### KL Divergence Regularization

For stable policy optimization:

$$
D_{\text{KL}}(\pi_{\text{old}} \| \pi_{\text{new}}) = \mathbb{E}_{s \sim \rho^\pi} \left[ \sum_a \pi_{\text{old}}(a|s) \log \frac{\pi_{\text{old}}(a|s)}{\pi_{\text{new}}(a|s)} \right] \tag{3}
$$

## Referencing Equations

As shown in Equation $(1)$, the policy gradient depends on the expected return. The diffusion loss in Equation $(2)$ uses 3D representations. KL regularization in Equation $(3)$ prevents policy collapse.

## Matrix Notation

The linear system for our optimization:

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
\end{bmatrix} \tag{4}
$$

## Code + Math

```python
import torch

def diffusion_loss(model, x_0, condition):
    """Compute diffusion loss with 3D condition (Eq. 2)."""
    t = torch.randint(0, model.timesteps, (x_0.shape[0],))
    noise = torch.randn_like(x_0)
    x_t = model.q_sample(x_0, t, noise)
    pred_noise = model(x_t, t, condition)
    return torch.mean((noise - pred_noise) ** 2)
```

The loss function above implements Equation $(2)$ in practice.

---

*This post demonstrates that KaTeX math rendering works seamlessly in the Astro blog setup.*
