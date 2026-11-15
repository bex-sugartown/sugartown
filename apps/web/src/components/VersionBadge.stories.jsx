import VersionBadge from './VersionBadge'

/**
 * ## VersionBadge
 *
 * Release kind as a tinted mono label, used in the release tables on the
 * governance page and the trust report (ST-228). Toggle the theme to check dark.
 */
export default {
  title: 'Components/VersionBadge',
  component: VersionBadge,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    kind: { control: { type: 'radio' }, options: ['minor', 'major', 'patch'], description: 'Release kind. Case-insensitive.' },
  },
}

/** Every kind, plus an unknown kind, which renders untinted. */
export const AllKinds = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <VersionBadge kind="minor" />
      <VersionBadge kind="major" />
      <VersionBadge kind="patch" />
      <VersionBadge kind="Hotfix" />
    </div>
  ),
}
