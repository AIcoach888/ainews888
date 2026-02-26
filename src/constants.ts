import { Article, User } from './types';

export const MOCK_USER: User = {
  name: "Alex Developer",
  email: "alex.dev@ai-platform.com",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCok2toa2m2CNIc-AH4IK_hrDbzF1yfr9EJc_Ksk9sPWKZz8sKXzcNZJ_TZcx6Jx0Na0aTodzZJDATBnNsUDcEI80sV61rlLq5mS1aGkM4d4zt1sDgIEPOUlDMqwfzKeJwF7t9i3dnlYdD8_o1rL9jO6c-hXAsAs6yCs62VF29dwHoKENU0iii6-agoC5BIYBp7oI1103HuXLaobOxTR9sbPnuVKTPMPwDjC4_V0m9nA3XmPHVV66gxxsWt2pX2RZhvQmQKhYxCacEK",
  isPro: true
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    title: "GPT-5 传闻：目前我们所知的一切功能预测与发布时间表",
    excerpt: "随着人工智能领域的飞速发展，关于 OpenAI 下一代大模型的传闻也日益增多...",
    category: "大模型资讯",
    author: "Sarah Chen",
    date: "2小时前",
    readTime: "8分钟",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDolIQlyo_hU7FUUwMS1lWEw-O3MSnFRwDQDI5GiC_AW8VpvlP5pK1hdC053mdp0wwn0sqgTIXcjqeJKty8egPQDjlOSAbmTYb9igIGw-gfgOTOu7JVPFnAMw9IH4VXgw6bBwNMwtPfaiMFepwLkqCSo3NLwc6TM7ZBEdQsO6gmGnv-ccOT4qNZnj_gXQUIX0eX485ZXNienzNu9A9XqAdvvrQD0eqk55EBcB0UIPOnWybw3xLlDhRcR86FIhT_oInANeAFkBYMo3Sm",
    likes: "1.2w",
    isFavorite: false
  },
  {
    id: "2",
    title: "Midjourney V7 Alpha 测试开始，文本渲染能力大幅提升",
    excerpt: "Midjourney 官方近日开启了 V7 版本的 Alpha 测试，最引人注目的是其在图像中生成准确文本的能力...",
    category: "AI绘画",
    author: "David Miller",
    date: "5小时前",
    readTime: "5分钟",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD00xjLgxo1yfdm5025ZW9gz0f-Z1f1-N6kaC8fAjKyWi6LupJJDO0uDnPaCUghcvwfskl2PpZgnW8KMaQ_mgxGH_fRHGfcOcH45OyR3Ex5oLMBpm--hdf8Qw2d0tR1_MejFsLmeSjlWh2hGc4Ao1K7-IOXwDa80XV6cIJrFzG5G5Oniw55aIeQsmLWSxAT6hBPqbWGBuPgWgrOSXUXjbQbCFe3Ufx7sMhHaTCN9LXeFTbhTK9EpGMDvIMEriBZL1Nlt2REjj6TwJdP",
    likes: "8.4k",
    isFavorite: false
  },
  {
    id: "3",
    title: "新 Python 库 'TensorFlow Lite' 助力移动端模型优化提速 50%",
    excerpt: "谷歌发布了针对移动端优化的全新 TensorFlow Lite 库，大幅提升了在 Android 和 iOS 上的推理速度...",
    category: "AI编程",
    author: "James Wilson",
    date: "8小时前",
    readTime: "10分钟",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuANH5Fofr_1PesOp_9_3gZwIwCxheHqnpPNOFcbiME9oSgsQUVxV31M1YDW7uDagOeWFIfJjDk1kJPKAyP8o0obpt0CywxwNgbzIyAB3r_5aC4QYjyRB579vQ5V3UN7HH8O2pzsk62DtihHzHSfDtGr-1YmMaimLF8KwGRvUKDwLNh3vjzrR3yEdztuW74gxnyDd6kORtdaAVtB8wCCiyqYy905TLcZVsI-D3WQIS4PD8KE2V_xM3Wg7Cj6VSeLsOH2Glw1VOea_qFX",
    likes: "3.2k",
    isFavorite: false
  },
  {
    id: "4",
    title: "Transformer 模型架构全解析：深入理解注意力机制",
    excerpt: "本文将带你深入剖析 Transformer 的核心组件，特别是 Self-Attention 机制的数学原理...",
    category: "深度研究",
    author: "Sarah Chen",
    date: "10月26日",
    readTime: "15分钟",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCowj4YXVMNbL-okrbNCJ_B4GV5qwXwWh1mHf9HAcuajMLocLsu2U7yoDA92ePZdkXXCO8XbteGloTuXOH03kfmk4potp7iGmP_DkllwiF8yDMUArZXtZ_MYdfbWWXFJ2sUCN0Z1y47fT6wVp1DDcVf0FQ89r7zbubw74-gR1AUQMSh_lTwxPh460yirD8IpQ7sMUmabS_IZ6zFwUthvM0hOq1Zd2mKQ8qCZ4pEeFzOs-PshSNzzBnNTtHW1H-KbGdSGtIFmjAy0S6q",
    likes: "15k",
    isFavorite: false
  }
];
