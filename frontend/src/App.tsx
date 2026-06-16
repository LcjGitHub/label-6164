import { Layout, Segmented, Typography } from 'antd';
import { useState } from 'react';

import ComparisonPage from './pages/ComparisonPage';
import OverviewPage from './pages/OverviewPage';
import SignListPage from './pages/SignListPage';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

type PageKey = 'list' | 'overview' | 'comparison';

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('list');

  const getPageDescription = () => {
    switch (activePage) {
      case 'list':
        return '按城市浏览各地老式路名牌的字体风格、背景色与材质规范。';
      case 'overview':
        return '查看各城市路名牌记录数量与统一规范占比统计。';
      case 'comparison':
        return '选择两条路名牌记录进行并排对比，字段差异将高亮显示。';
      default:
        return '';
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'list':
        return <SignListPage />;
      case 'overview':
        return <OverviewPage />;
      case 'comparison':
        return <ComparisonPage />;
      default:
        return <SignListPage />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0, lineHeight: 1.4 }}>
          老式路名牌字体图鉴
        </Title>
        <Segmented
          value={activePage}
          onChange={(value) => setActivePage(value as PageKey)}
          options={[
            { label: '列表', value: 'list' },
            { label: '概览', value: 'overview' },
            { label: '对比', value: 'comparison' },
          ]}
          size="middle"
        />
      </Header>
      <Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {getPageDescription()}
        </Paragraph>
        {renderPage()}
      </Content>
    </Layout>
  );
}
