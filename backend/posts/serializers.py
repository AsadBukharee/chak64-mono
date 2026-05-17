from rest_framework import serializers
from .models import (
    Post, Comment, Campaign, Donation, Team, TeamMember, NeedyPerson,
    Poll, PollOption, PollVote, Survey, SurveyResponse, Report,
    Advertisement, LiveBroadcast, ZakatCollection, AboutSection,
    CharityType, FundType, Personality, VillageHistory,
)


class PostSerializer(serializers.ModelSerializer):
    author_is_verified = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = '__all__'

    def get_author_is_verified(self, obj):
        from auth_app.models import User
        try:
            user = User.objects.get(email=obj.author_email)
            return user.is_verified
        except User.DoesNotExist:
            return False


class CommentSerializer(serializers.ModelSerializer):
    post_id = serializers.CharField(write_only=False, required=False)
    parent_comment_id = serializers.CharField(write_only=False, required=False, allow_null=True, allow_blank=True)
    author_is_verified = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post_id', 'content', 'author_name', 'author_email',
            'parent_comment_id', 'media_url', 'media_type', 'voice_note_url',
            'mentioned_users', 'reactions', 'created_date', 'author_is_verified',
        ]
        read_only_fields = ['id', 'created_date']

    def get_author_is_verified(self, obj):
        from auth_app.models import User
        try:
            user = User.objects.get(email=obj.author_email)
            return user.is_verified
        except User.DoesNotExist:
            return False

    def create(self, validated_data):
        post_id = validated_data.pop('post_id', None)
        parent_id = validated_data.pop('parent_comment_id', None)
        if post_id:
            validated_data['post_id'] = int(post_id)
        if parent_id:
            validated_data['parent_comment_id'] = int(parent_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['post_id'] = str(instance.post_id) if instance.post_id else None
        data['parent_comment_id'] = str(instance.parent_comment_id) if instance.parent_comment_id else None
        return data


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class TeamMemberSerializer(serializers.ModelSerializer):
    team_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = TeamMember
        fields = [
            'id', 'team_id', 'member_email', 'member_name', 'role',
            'joined_date', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        team_id = validated_data.pop('team_id', None)
        if team_id:
            validated_data['team_id'] = int(team_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['team_id'] = str(instance.team_id) if instance.team_id else None
        return data


class NeedyPersonSerializer(serializers.ModelSerializer):
    team_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = NeedyPerson
        fields = [
            'id', 'team_id', 'full_name', 'address', 'contact_number',
            'family_size', 'need_type', 'monthly_income', 'description',
            'priority', 'status', 'added_by', 'added_by_name', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        team_id = validated_data.pop('team_id', None)
        if team_id:
            validated_data['team_id'] = int(team_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['team_id'] = str(instance.team_id) if instance.team_id else None
        return data


class PollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poll
        fields = '__all__'


class PollOptionSerializer(serializers.ModelSerializer):
    poll_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = PollOption
        fields = ['id', 'poll_id', 'option_text', 'votes_count', 'created_date']
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        poll_id = validated_data.pop('poll_id', None)
        if poll_id:
            validated_data['poll_id'] = int(poll_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['poll_id'] = str(instance.poll_id) if instance.poll_id else None
        return data


class PollVoteSerializer(serializers.ModelSerializer):
    poll_id = serializers.CharField(write_only=False, required=False)
    option_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = PollVote
        fields = ['id', 'poll_id', 'option_id', 'voter_email', 'created_date']
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        poll_id = validated_data.pop('poll_id', None)
        option_id = validated_data.pop('option_id', None)
        if poll_id:
            validated_data['poll_id'] = int(poll_id)
        if option_id:
            validated_data['option_id'] = int(option_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['poll_id'] = str(instance.poll_id) if instance.poll_id else None
        data['option_id'] = str(instance.option_id) if instance.option_id else None
        return data


class SurveySerializer(serializers.ModelSerializer):
    team_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = Survey
        fields = [
            'id', 'team_id', 'title', 'description', 'survey_type',
            'status', 'questions', 'created_by', 'created_by_name', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        team_id = validated_data.pop('team_id', None)
        if team_id:
            validated_data['team_id'] = int(team_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['team_id'] = str(instance.team_id) if instance.team_id else None
        return data


class SurveyResponseSerializer(serializers.ModelSerializer):
    survey_id = serializers.CharField(write_only=False, required=False)
    team_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = SurveyResponse
        fields = [
            'id', 'survey_id', 'team_id', 'respondent_name', 'respondent_address',
            'answers', 'submitted_by', 'submitted_by_name', 'notes', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        survey_id = validated_data.pop('survey_id', None)
        team_id = validated_data.pop('team_id', None)
        if survey_id:
            validated_data['survey_id'] = int(survey_id)
        if team_id:
            validated_data['team_id'] = int(team_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['survey_id'] = str(instance.survey_id) if instance.survey_id else None
        data['team_id'] = str(instance.team_id) if instance.team_id else None
        return data


class ReportSerializer(serializers.ModelSerializer):
    post_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = Report
        fields = [
            'id', 'post_id', 'reporter_email', 'reporter_name', 'reason',
            'notes', 'status', 'post_author_email', 'post_content_preview', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        post_id = validated_data.pop('post_id', None)
        if post_id:
            validated_data['post_id'] = int(post_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['post_id'] = str(instance.post_id) if instance.post_id else None
        return data


class AdvertisementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertisement
        fields = '__all__'


class LiveBroadcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveBroadcast
        fields = '__all__'


class ZakatCollectionSerializer(serializers.ModelSerializer):
    team_id = serializers.CharField(write_only=False, required=False)

    class Meta:
        model = ZakatCollection
        fields = [
            'id', 'team_id', 'collector_name', 'collector_email', 'donor_name',
            'donor_address', 'amount', 'collection_date', 'notes', 'status', 'created_date',
        ]
        read_only_fields = ['id', 'created_date']

    def create(self, validated_data):
        team_id = validated_data.pop('team_id', None)
        if team_id:
            validated_data['team_id'] = int(team_id)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['team_id'] = str(instance.team_id) if instance.team_id else None
        return data


class AboutSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutSection
        fields = '__all__'


class CharityTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CharityType
        fields = '__all__'


class FundTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundType
        fields = '__all__'


class PersonalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Personality
        fields = '__all__'


class VillageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VillageHistory
        fields = '__all__'
