'use client'

import { Users, UsersRound, MailPlus } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface MembersTabsProps {
  isAdmin: boolean
  annuaireContent: React.ReactNode
  groupesContent: React.ReactNode
  invitationsContent: React.ReactNode
}

export function MembersTabs({
  isAdmin,
  annuaireContent,
  groupesContent,
  invitationsContent,
}: MembersTabsProps) {
  return (
    <Tabs defaultValue="annuaire">
      <TabsList variant="line">
        <TabsTrigger value="annuaire">
          <Users className="h-4 w-4" />
          Annuaire
        </TabsTrigger>
        <TabsTrigger value="groupes">
          <UsersRound className="h-4 w-4" />
          Groupes
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="invitations">
            <MailPlus className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="annuaire">
        {annuaireContent}
      </TabsContent>

      <TabsContent value="groupes">
        {groupesContent}
      </TabsContent>

      {isAdmin && (
        <TabsContent value="invitations">
          {invitationsContent}
        </TabsContent>
      )}
    </Tabs>
  )
}
