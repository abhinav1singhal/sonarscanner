import React from 'react'

import { SwitchControl, Flex, FlexItem, TextInputField } from '@unqork/interface'

import { ServiceForm } from '../../../services/types'
import styles from './LoggingSection.css'

type LoggingSectionProps = {
  form: ServiceForm
  editing: boolean
  onToggle: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  sidebarId: string
}
//testing
const LoggingSection = ({ form, editing, onToggle, onChange, sidebarId }: LoggingSectionProps) => (
  <>
    <h1 id={sidebarId} className={styles.sectionTitle}>
      Logging
    </h1>
    <SwitchControl
      checked={form.logConfig?.storeBody}
      label="Capture request and response bodies:"
      onToggle={onToggle}
      disabled={!editing}
    />
    <Flex className={styles.loggerInputs} columnGap="xxxlarge">
      <FlexItem>
        <TextInputField
          label="Retention days (defaults to 30 days):"
          name="retentionDays"
          onChange={onChange}
          value={form.logConfig?.retentionDays ? String(form.logConfig?.retentionDays) : ''}
          disabled={!editing || !form.logConfig?.storeBody}
        />
      </FlexItem>
      <FlexItem grow={1}>
        <TextInputField
          label="Pagerduty service key (for optional alerting)"
          name="pagerdutyKey"
          onChange={onChange}
          value={form.logConfig?.pagerdutyKey}
          disabled={!editing || !form.logConfig?.storeBody}
        />
      </FlexItem>
    </Flex>
  </>
)

export default LoggingSection
