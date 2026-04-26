# Thread Social App - Design PRD

## Overview
A Threads-like social media app with post creation, media upload, interactions (like, reply, repost, share), and a clean, modern interface.

## Pages
Single-page app with modals for interactions.

## Theme
- Background: #0a0a0a (dark, near-black)
- Card/Post background: #181818
- Text primary: #ffffff
- Text secondary: #717375 (muted gray)
- Accent: #ffffff (for buttons, borders)
- Borders: #2f3336
- Hover states: rgba(255,255,255,0.1)
- Font: system-ui, -apple-system, sans-serif (native feel)

## Components

### Header
- Logo "Thread" centered
- Navigation: Home, Search, Activity, Profile icons
- Clean minimal top bar with border-bottom

### Compose Section
- Avatar on left
- Textarea placeholder "What's new?"
- Image upload button (paperclip icon)
- Post button (white bg, black text)
- Image preview grid before posting

### Thread Card
- Avatar (rounded-full)
- Username + timestamp
- Thread text content
- Image grid (1-4 images, responsive layout)
- Action bar: Like (heart), Reply (speech bubble), Repost (recycle), Share (arrow up)
- Like count, reply count
- Hover effects on actions

### Reply Modal
- Overlay with thread being replied to
- Text input for reply
- Post reply button

## Animations & Interactions
- Like: heart scale pulse on click, fill animation
- Post creation: smooth expand/collapse
- Image upload: fade-in preview
- Repost: icon rotation on click
- Smooth hover transitions (0.2s ease)
- New post appears with fade-in + slide-down

## State Management
- threads[]: array of thread objects {id, author, avatar, content, images, likes, replies, reposts, isLiked, timestamp}
- replies[]: nested within threads
- currentUser: avatar, username
- Modal state for replies

## Features
1. Create thread with text + up to 4 images
2. Like/unlike with animation
3. Reply to threads (opens modal)
4. Repost toggle
5. Share (copy to clipboard toast)
6. Delete own posts
7. Responsive: works on mobile and desktop